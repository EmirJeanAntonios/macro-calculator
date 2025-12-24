// User input types
export type Gender = 'male' | 'female';
export type Goal = 'weight_loss' | 'maintenance' | 'muscle_gain';
export type WeightUnit = 'kg' | 'lbs';
export type HeightUnit = 'cm' | 'ft';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
// WorkoutType is now a dynamic string (not an enum) to support custom types
export type WorkoutType = string;

// Dynamic workout type from API
export interface WorkoutTypeOption {
  key: string;
  name: string;
  intensity: number;
  icon: string | null;
  color: string | null;
  description: string | null;
}

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
  type: string; // Dynamic workout type key
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

