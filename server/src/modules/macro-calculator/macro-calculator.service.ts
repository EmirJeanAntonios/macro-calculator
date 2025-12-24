import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalculateMacrosDto, UserInputDto, WorkoutDto } from './dto';
import {
  UserInput,
  Workout,
  MacroResult,
  WeightUnit,
  HeightUnit,
  Goal,
  Gender,
  WorkoutType,
} from '../../entities';

@Injectable()
export class MacroCalculatorService {
  constructor(
    @InjectRepository(UserInput)
    private userInputRepository: Repository<UserInput>,
    @InjectRepository(Workout)
    private workoutRepository: Repository<Workout>,
    @InjectRepository(MacroResult)
    private macroResultRepository: Repository<MacroResult>,
  ) {}

  /**
   * Main method to calculate macros based on user input and workout schedule
   */
  async calculateMacros(dto: CalculateMacrosDto): Promise<MacroResult> {
    const { userInput, workouts } = dto;

    // Convert units to metric for calculations
    const weightKg = this.convertToKg(userInput.weight, userInput.weightUnit);
    const heightCm = this.convertToCm(userInput.height, userInput.heightUnit);

    // Calculate BMR using Mifflin-St Jeor Equation
    const bmr = this.calculateBMR(weightKg, heightCm, userInput.age, userInput.gender);

    // Calculate average activity level from workout schedule
    const activityMultiplier = this.calculateActivityMultiplier(workouts);

    // Calculate TDEE
    const tdee = Math.round(bmr * activityMultiplier);

    // Calculate daily calories based on goal
    const dailyCalories = this.calculateCaloriesForGoal(tdee, userInput.goal);

    // Calculate macro distribution
    const macros = this.calculateMacroDistribution(dailyCalories, weightKg, userInput.goal);

    // Calculate special day macros (workout vs rest days)
    const workoutDayMacros = this.calculateWorkoutDayMacros(dailyCalories, weightKg, userInput.goal);
    const restDayMacros = this.calculateRestDayMacros(dailyCalories, weightKg, userInput.goal);

    // Save to database
    const savedUserInput = await this.saveUserInput(userInput);
    await this.saveWorkouts(workouts, savedUserInput.id);

    const macroResult = this.macroResultRepository.create({
      bmr: Math.round(bmr),
      tdee,
      dailyCalories,
      protein: macros.protein,
      carbs: macros.carbs,
      fats: macros.fats,
      workoutDayCalories: workoutDayMacros.calories,
      workoutDayProtein: workoutDayMacros.protein,
      workoutDayCarbs: workoutDayMacros.carbs,
      workoutDayFats: workoutDayMacros.fats,
      restDayCalories: restDayMacros.calories,
      restDayProtein: restDayMacros.protein,
      restDayCarbs: restDayMacros.carbs,
      restDayFats: restDayMacros.fats,
      userInputId: savedUserInput.id,
    });

    return this.macroResultRepository.save(macroResult);
  }

  /**
   * Get macro result by ID
   */
  async getResultById(id: string): Promise<MacroResult | null> {
    return this.macroResultRepository.findOne({
      where: { id },
      relations: ['userInput', 'userInput.workouts'],
    });
  }

  /**
   * Get all macro results (most recent first)
   */
  async getAllResults(): Promise<MacroResult[]> {
    return this.macroResultRepository.find({
      relations: ['userInput', 'userInput.workouts'],
      order: { calculatedAt: 'DESC' },
    });
  }

  // ============ PRIVATE HELPER METHODS ============

  /**
   * Calculate BMR using Mifflin-St Jeor Equation
   * Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
   * Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
   */
  private calculateBMR(
    weightKg: number,
    heightCm: number,
    age: number,
    gender: Gender,
  ): number {
    const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return gender === Gender.MALE ? baseBMR + 5 : baseBMR - 161;
  }

  /**
   * Get intensity multiplier for each workout type
   * Scale: 0.5 (very low) to 2.0 (extreme)
   * Based on MET (Metabolic Equivalent of Task) values
   */
  private getWorkoutIntensity(type: WorkoutType): number {
    const intensityMap: Record<WorkoutType, number> = {
      [WorkoutType.REST]: 0,
      [WorkoutType.WALKING]: 0.5,        // ~3.5 METs - Light activity
      [WorkoutType.YOGA]: 0.6,           // ~3-4 METs - Light to moderate
      [WorkoutType.PILATES]: 0.7,        // ~4 METs - Moderate
      [WorkoutType.CYCLING]: 0.9,        // ~6-8 METs - Moderate to vigorous (depends on intensity)
      [WorkoutType.DANCE]: 0.9,          // ~5-8 METs - Moderate to vigorous
      [WorkoutType.SWIMMING]: 1.0,       // ~6-10 METs - Moderate to vigorous
      [WorkoutType.STRENGTH]: 1.0,       // ~5-6 METs - Moderate
      [WorkoutType.CARDIO]: 1.1,         // ~7-10 METs - Vigorous
      [WorkoutType.RUNNING]: 1.2,        // ~8-12 METs - Vigorous
      [WorkoutType.CLIMBING]: 1.2,       // ~8-11 METs - Vigorous
      [WorkoutType.SPORTS]: 1.2,         // ~6-12 METs - Variable, assume vigorous
      [WorkoutType.MARTIAL_ARTS]: 1.4,   // ~10-12 METs - Very vigorous
      [WorkoutType.BOXING]: 1.5,         // ~10-13 METs - Very vigorous
      [WorkoutType.HIIT]: 1.6,           // ~12-15 METs - Extreme
      [WorkoutType.CROSSFIT]: 1.7,       // ~12-16 METs - Extreme
      [WorkoutType.OTHER]: 1.0,          // Default to moderate
    };
    return intensityMap[type] ?? 1.0;
  }

  /**
   * Calculate activity multiplier based on workout schedule
   * Takes into account both duration and intensity of each workout
   */
  private calculateActivityMultiplier(workouts: WorkoutDto[]): number {
    const workoutDays = workouts.filter(w => w.type !== WorkoutType.REST);
    
    // Calculate intensity-weighted hours
    // Formula: hours × intensity multiplier
    const weightedHours = workoutDays.reduce((sum, w) => {
      const intensity = this.getWorkoutIntensity(w.type);
      return sum + (w.hours * intensity);
    }, 0);
    
    // Average weighted hours per day
    const avgWeightedHours = weightedHours / 7;

    // Activity multipliers based on intensity-weighted average daily exercise
    // These thresholds are adjusted for the weighted calculation
    if (avgWeightedHours < 0.3) return 1.2;    // Sedentary (little to no exercise)
    if (avgWeightedHours < 0.6) return 1.375;  // Lightly active (light exercise 1-3 days/week)
    if (avgWeightedHours < 1.0) return 1.55;   // Moderately active (moderate exercise 3-5 days/week)
    if (avgWeightedHours < 1.5) return 1.725;  // Very active (hard exercise 6-7 days/week)
    if (avgWeightedHours < 2.0) return 1.9;    // Extra active (very hard exercise, physical job)
    return 2.0;                                 // Athlete level (intense training twice daily)
  }

  /**
   * Calculate daily calories based on goal
   */
  private calculateCaloriesForGoal(tdee: number, goal: Goal): number {
    switch (goal) {
      case Goal.WEIGHT_LOSS:
        return Math.round(tdee * 0.8); // 20% deficit
      case Goal.MUSCLE_GAIN:
        return Math.round(tdee * 1.1); // 10% surplus
      case Goal.MAINTENANCE:
      default:
        return tdee;
    }
  }

  /**
   * Calculate macro distribution based on calories and goal
   */
  private calculateMacroDistribution(
    calories: number,
    weightKg: number,
    goal: Goal,
  ): { protein: number; carbs: number; fats: number } {
    let proteinRatio: number;
    let fatRatio: number;

    switch (goal) {
      case Goal.WEIGHT_LOSS:
        // Higher protein to preserve muscle during deficit
        proteinRatio = 0.35;
        fatRatio = 0.3;
        break;
      case Goal.MUSCLE_GAIN:
        // High protein for muscle building
        proteinRatio = 0.3;
        fatRatio = 0.25;
        break;
      case Goal.MAINTENANCE:
      default:
        proteinRatio = 0.25;
        fatRatio = 0.3;
    }

    const carbRatio = 1 - proteinRatio - fatRatio;

    // Protein: 4 cal/g, Carbs: 4 cal/g, Fats: 9 cal/g
    const protein = Math.round((calories * proteinRatio) / 4);
    const carbs = Math.round((calories * carbRatio) / 4);
    const fats = Math.round((calories * fatRatio) / 9);

    // Ensure minimum protein based on body weight (1.6g per kg for active individuals)
    const minProtein = Math.round(weightKg * 1.6);
    const finalProtein = Math.max(protein, minProtein);

    return { protein: finalProtein, carbs, fats };
  }

  /**
   * Calculate workout day macros (higher carbs for energy)
   */
  private calculateWorkoutDayMacros(
    baseCalories: number,
    weightKg: number,
    goal: Goal,
  ): { calories: number; protein: number; carbs: number; fats: number } {
    // Add 10% more calories on workout days
    const calories = Math.round(baseCalories * 1.1);
    
    // Higher carb ratio on workout days
    const protein = Math.round(weightKg * 2); // 2g per kg
    const fats = Math.round((calories * 0.25) / 9);
    const carbCalories = calories - (protein * 4) - (fats * 9);
    const carbs = Math.round(carbCalories / 4);

    return { calories, protein, carbs, fats };
  }

  /**
   * Calculate rest day macros (lower carbs)
   */
  private calculateRestDayMacros(
    baseCalories: number,
    weightKg: number,
    goal: Goal,
  ): { calories: number; protein: number; carbs: number; fats: number } {
    // Slightly fewer calories on rest days
    const calories = Math.round(baseCalories * 0.9);
    
    // Lower carb ratio on rest days, higher fat
    const protein = Math.round(weightKg * 1.8); // 1.8g per kg
    const fats = Math.round((calories * 0.35) / 9);
    const carbCalories = calories - (protein * 4) - (fats * 9);
    const carbs = Math.round(carbCalories / 4);

    return { calories, protein, carbs, fats };
  }

  /**
   * Convert weight to kilograms
   */
  private convertToKg(weight: number, unit: WeightUnit): number {
    return unit === WeightUnit.LBS ? weight * 0.453592 : weight;
  }

  /**
   * Convert height to centimeters
   */
  private convertToCm(height: number, unit: HeightUnit): number {
    return unit === HeightUnit.FT ? height * 30.48 : height;
  }

  /**
   * Save user input to database
   */
  private async saveUserInput(dto: UserInputDto): Promise<UserInput> {
    const userInput = this.userInputRepository.create({
      age: dto.age,
      gender: dto.gender,
      weight: dto.weight,
      weightUnit: dto.weightUnit,
      height: dto.height,
      heightUnit: dto.heightUnit,
      goal: dto.goal,
    });
    return this.userInputRepository.save(userInput);
  }

  /**
   * Save workouts to database
   */
  private async saveWorkouts(
    workouts: WorkoutDto[],
    userInputId: string,
  ): Promise<Workout[]> {
    const workoutEntities = workouts.map((w) =>
      this.workoutRepository.create({
        day: w.day,
        type: w.type,
        hours: w.hours,
        notes: w.notes,
        userInputId,
      }),
    );
    return this.workoutRepository.save(workoutEntities);
  }
}

