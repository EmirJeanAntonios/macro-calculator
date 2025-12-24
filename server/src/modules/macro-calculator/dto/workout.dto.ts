import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { DayOfWeek, WorkoutType } from '../../../entities';

export class WorkoutDto {
  @IsEnum(DayOfWeek, {
    message:
      'Day must be a valid day of the week (monday, tuesday, wednesday, thursday, friday, saturday, sunday)',
  })
  day: DayOfWeek;

  @IsEnum(WorkoutType, {
    message:
      'Workout type must be one of: rest, cardio, strength, hiit, yoga, sports, other',
  })
  type: WorkoutType;

  @IsNumber()
  @Min(0, { message: 'Hours cannot be negative' })
  @Max(24, { message: 'Hours cannot exceed 24' })
  hours: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

