import {
  IsEnum,
  IsInt,
  IsNumber,
  IsPositive,
  Min,
  Max,
} from 'class-validator';
import { Gender, Goal, WeightUnit, HeightUnit } from '../../../entities';

export class UserInputDto {
  @IsInt()
  @Min(13, { message: 'Age must be at least 13 years old' })
  @Max(120, { message: 'Age must be at most 120 years old' })
  age: number;

  @IsEnum(Gender, { message: 'Gender must be either "male" or "female"' })
  gender: Gender;

  @IsNumber()
  @IsPositive({ message: 'Weight must be a positive number' })
  @Max(700, { message: 'Weight seems unrealistic' })
  weight: number;

  @IsEnum(WeightUnit, { message: 'Weight unit must be either "kg" or "lbs"' })
  weightUnit: WeightUnit;

  @IsNumber()
  @IsPositive({ message: 'Height must be a positive number' })
  @Max(300, { message: 'Height seems unrealistic' })
  height: number;

  @IsEnum(HeightUnit, { message: 'Height unit must be either "cm" or "ft"' })
  heightUnit: HeightUnit;

  @IsEnum(Goal, {
    message: 'Goal must be "weight_loss", "maintenance", or "muscle_gain"',
  })
  goal: Goal;
}

