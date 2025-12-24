import { Type } from 'class-transformer';
import { ValidateNested, IsArray, ArrayMinSize } from 'class-validator';
import { UserInputDto } from './user-input.dto';
import { WorkoutDto } from './workout.dto';

export class CalculateMacrosDto {
  @ValidateNested()
  @Type(() => UserInputDto)
  userInput: UserInputDto;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one workout day must be provided' })
  @ValidateNested({ each: true })
  @Type(() => WorkoutDto)
  workouts: WorkoutDto[];
}

