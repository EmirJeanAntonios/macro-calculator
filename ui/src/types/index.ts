// User input types
export type Gender = 'male' | 'female';
export type Goal = 'weight_loss' | 'maintenance' | 'muscle_gain';
export type WeightUnit = 'kg' | 'lbs';
export type HeightUnit = 'cm' | 'ft';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type WorkoutType = 
  | 'rest' 
  | 'cardio' 
  | 'strength' 
  | 'hiit' 
  | 'yoga' 
  | 'sports' 
  | 'running' 
  | 'cycling' 
  | 'swimming' 
  | 'pilates' 
  | 'crossfit' 
  | 'boxing' 
  | 'dance' 
  | 'walking' 
  | 'climbing' 
  | 'martial_arts' 
  | 'other';

export interface UserInput {
  age: number;
  gender: Gender;
  weight: number;
  weightUnit: WeightUnit;
  height: number;
  heightUnit: HeightUnit;
  goal: Goal;
}

export interface Workout {
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
  userInput?: UserInputWithWorkouts;
}

export interface UserInputWithWorkouts extends UserInput {
  id: string;
  workouts: Workout[];
}

export interface CalculateRequest {
  userInput: UserInput;
  workouts: Workout[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

