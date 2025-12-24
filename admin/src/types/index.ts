export type Gender = 'male' | 'female';
export type WeightUnit = 'kg' | 'lbs';
export type HeightUnit = 'cm' | 'ft';
export type Goal = 'weight_loss' | 'maintenance' | 'muscle_gain';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type WorkoutType = 'rest' | 'cardio' | 'strength' | 'hiit' | 'yoga' | 'sports' | 'running' | 'cycling' | 'swimming' | 'crossfit' | 'pilates' | 'boxing' | 'martial_arts' | 'dance' | 'climbing' | 'walking' | 'other';

export interface UserInput {
  id?: string;
  age: number;
  gender: Gender;
  weight: number;
  weightUnit: WeightUnit;
  height: number;
  heightUnit: HeightUnit;
  goal: Goal;
}

export interface Workout {
  id?: string;
  day: DayOfWeek;
  type: WorkoutType;
  hours: number;
  notes?: string;
}

export interface MacroResult {
  id: string;
  bmr: number;
  tdee: number;
  dailyCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  workoutDayCalories?: number;
  workoutDayProtein?: number;
  workoutDayCarbs?: number;
  workoutDayFats?: number;
  restDayCalories?: number;
  restDayProtein?: number;
  restDayCarbs?: number;
  restDayFats?: number;
  calculatedAt: string;
  userInput?: UserInput;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

