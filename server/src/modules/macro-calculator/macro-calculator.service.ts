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
  Configuration,
  WorkoutCategory,
} from '../../entities';

@Injectable()
export class MacroCalculatorService {
  private configCache: Record<string, number> = {};
  private configCacheTime = 0;
  private intensityCache: Record<string, number> = {};
  private intensityCacheTime = 0;
  private readonly CACHE_TTL = 60000; // 1 minute cache

  constructor(
    @InjectRepository(UserInput)
    private userInputRepository: Repository<UserInput>,
    @InjectRepository(Workout)
    private workoutRepository: Repository<Workout>,
    @InjectRepository(MacroResult)
    private macroResultRepository: Repository<MacroResult>,
    @InjectRepository(Configuration)
    private configRepository: Repository<Configuration>,
    @InjectRepository(WorkoutCategory)
    private workoutCategoryRepository: Repository<WorkoutCategory>,
  ) {}

  /**
   * Load configuration values from database with caching
   */
  private async loadConfig(): Promise<Record<string, number>> {
    const now = Date.now();
    if (now - this.configCacheTime < this.CACHE_TTL && Object.keys(this.configCache).length > 0) {
      return this.configCache;
    }

    const configs = await this.configRepository.find();
    this.configCache = configs.reduce((acc, c) => {
      acc[c.key] = Number(c.value);
      return acc;
    }, {} as Record<string, number>);
    this.configCacheTime = now;
    return this.configCache;
  }

  /**
   * Load workout intensity values from database with caching
   */
  private async loadIntensityMap(): Promise<Record<string, number>> {
    const now = Date.now();
    if (now - this.intensityCacheTime < this.CACHE_TTL && Object.keys(this.intensityCache).length > 0) {
      return this.intensityCache;
    }

    const categories = await this.workoutCategoryRepository.find({
      where: { isActive: true },
    });
    this.intensityCache = categories.reduce((acc, c) => {
      acc[c.key] = Number(c.intensity);
      return acc;
    }, {} as Record<string, number>);
    this.intensityCacheTime = now;
    return this.intensityCache;
  }

  /**
   * Get all active workout types for the frontend
   */
  async getWorkoutTypes() {
    const categories = await this.workoutCategoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    return categories.map(c => ({
      key: c.key,
      name: c.name,
      intensity: Number(c.intensity),
      icon: c.icon,
      color: c.color,
      description: c.description,
    }));
  }

  /**
   * Get a config value with fallback
   */
  private getConfigValue(config: Record<string, number>, key: string, fallback: number): number {
    return config[key] ?? fallback;
  }

  /**
   * Main method to calculate macros based on user input and workout schedule
   */
  async calculateMacros(dto: CalculateMacrosDto): Promise<MacroResult> {
    const { userInput, workouts } = dto;
    const config = await this.loadConfig();

    // Convert units to metric for calculations
    const weightKg = this.convertToKg(userInput.weight, userInput.weightUnit);
    const heightCm = this.convertToCm(userInput.height, userInput.heightUnit);

    // Calculate BMR using Mifflin-St Jeor Equation
    const bmr = this.calculateBMR(weightKg, heightCm, userInput.age, userInput.gender);

    // Calculate average activity level from workout schedule
    const activityMultiplier = await this.calculateActivityMultiplier(workouts, config);

    // Calculate TDEE
    const tdee = Math.round(bmr * activityMultiplier);

    // Calculate daily calories based on goal
    const dailyCalories = this.calculateCaloriesForGoal(tdee, userInput.goal, config);

    // Calculate macro distribution
    const macros = this.calculateMacroDistribution(dailyCalories, weightKg, userInput.goal, config);

    // Calculate special day macros (workout vs rest days)
    const workoutDayMacros = this.calculateWorkoutDayMacros(dailyCalories, weightKg, config);
    const restDayMacros = this.calculateRestDayMacros(dailyCalories, weightKg, config);

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
   * Get intensity multiplier for a workout type from the dynamic intensity map
   */
  private getWorkoutIntensity(type: string, intensityMap: Record<string, number>): number {
    // Return intensity from map, default to 1.0 if not found
    return intensityMap[type] ?? 1.0;
  }

  /**
   * Calculate activity multiplier based on workout schedule
   * Takes into account both duration and intensity of each workout
   */
  private async calculateActivityMultiplier(
    workouts: WorkoutDto[],
    config: Record<string, number>,
  ): Promise<number> {
    // Load intensity map from workout categories
    const intensityMap = await this.loadIntensityMap();
    
    // Filter out rest days
    const workoutDays = workouts.filter(w => w.type !== 'rest');
    
    // Calculate intensity-weighted hours
    const weightedHours = workoutDays.reduce((sum, w) => {
      const intensity = this.getWorkoutIntensity(w.type, intensityMap);
      return sum + (w.hours * intensity);
    }, 0);
    
    // Average weighted hours per day
    const avgWeightedHours = weightedHours / 7;

    // Get activity level multipliers from config
    const sedentary = this.getConfigValue(config, 'activity_sedentary', 1.2);
    const light = this.getConfigValue(config, 'activity_light', 1.375);
    const moderate = this.getConfigValue(config, 'activity_moderate', 1.55);
    const veryActive = this.getConfigValue(config, 'activity_very_active', 1.725);
    const extraActive = this.getConfigValue(config, 'activity_extra_active', 1.9);
    const athlete = this.getConfigValue(config, 'activity_athlete', 2.0);

    // Activity multipliers based on intensity-weighted average daily exercise
    if (avgWeightedHours < 0.3) return sedentary;
    if (avgWeightedHours < 0.6) return light;
    if (avgWeightedHours < 1.0) return moderate;
    if (avgWeightedHours < 1.5) return veryActive;
    if (avgWeightedHours < 2.0) return extraActive;
    return athlete;
  }

  /**
   * Calculate daily calories based on goal
   */
  private calculateCaloriesForGoal(
    tdee: number,
    goal: Goal,
    config: Record<string, number>,
  ): number {
    switch (goal) {
      case Goal.WEIGHT_LOSS:
        return Math.round(tdee * this.getConfigValue(config, 'goal_weight_loss', 0.8));
      case Goal.MUSCLE_GAIN:
        return Math.round(tdee * this.getConfigValue(config, 'goal_muscle_gain', 1.1));
      case Goal.MAINTENANCE:
      default:
        return Math.round(tdee * this.getConfigValue(config, 'goal_maintenance', 1.0));
    }
  }

  /**
   * Calculate macro distribution based on calories and goal
   */
  private calculateMacroDistribution(
    calories: number,
    weightKg: number,
    goal: Goal,
    config: Record<string, number>,
  ): { protein: number; carbs: number; fats: number } {
    let proteinRatio: number;
    let fatRatio: number;

    switch (goal) {
      case Goal.WEIGHT_LOSS:
        proteinRatio = this.getConfigValue(config, 'macro_protein_weight_loss', 0.35);
        fatRatio = this.getConfigValue(config, 'macro_fat_weight_loss', 0.30);
        break;
      case Goal.MUSCLE_GAIN:
        proteinRatio = this.getConfigValue(config, 'macro_protein_muscle_gain', 0.30);
        fatRatio = this.getConfigValue(config, 'macro_fat_muscle_gain', 0.25);
        break;
      case Goal.MAINTENANCE:
      default:
        proteinRatio = this.getConfigValue(config, 'macro_protein_maintenance', 0.25);
        fatRatio = this.getConfigValue(config, 'macro_fat_maintenance', 0.30);
    }

    const carbRatio = 1 - proteinRatio - fatRatio;

    // Protein: 4 cal/g, Carbs: 4 cal/g, Fats: 9 cal/g
    const protein = Math.round((calories * proteinRatio) / 4);
    const carbs = Math.round((calories * carbRatio) / 4);
    const fats = Math.round((calories * fatRatio) / 9);

    // Ensure minimum protein based on body weight
    const minProteinPerKg = this.getConfigValue(config, 'macro_min_protein_per_kg', 1.6);
    const minProtein = Math.round(weightKg * minProteinPerKg);
    const finalProtein = Math.max(protein, minProtein);

    return { protein: finalProtein, carbs, fats };
  }

  /**
   * Calculate workout day macros (higher carbs for energy)
   */
  private calculateWorkoutDayMacros(
    baseCalories: number,
    weightKg: number,
    config: Record<string, number>,
  ): { calories: number; protein: number; carbs: number; fats: number } {
    const multiplier = this.getConfigValue(config, 'workout_day_multiplier', 1.1);
    const proteinPerKg = this.getConfigValue(config, 'workout_day_protein_per_kg', 2.0);
    const fatRatio = this.getConfigValue(config, 'workout_day_fat_ratio', 0.25);

    const calories = Math.round(baseCalories * multiplier);
    const protein = Math.round(weightKg * proteinPerKg);
    const fats = Math.round((calories * fatRatio) / 9);
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
    config: Record<string, number>,
  ): { calories: number; protein: number; carbs: number; fats: number } {
    const multiplier = this.getConfigValue(config, 'rest_day_multiplier', 0.9);
    const proteinPerKg = this.getConfigValue(config, 'rest_day_protein_per_kg', 1.8);
    const fatRatio = this.getConfigValue(config, 'rest_day_fat_ratio', 0.35);

    const calories = Math.round(baseCalories * multiplier);
    const protein = Math.round(weightKg * proteinPerKg);
    const fats = Math.round((calories * fatRatio) / 9);
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
