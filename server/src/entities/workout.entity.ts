import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserInput } from './user-input.entity';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

export enum WorkoutType {
  REST = 'rest',
  CARDIO = 'cardio',
  STRENGTH = 'strength',
  HIIT = 'hiit',
  YOGA = 'yoga',
  SPORTS = 'sports',
  OTHER = 'other',
}

@Entity('workouts')
export class Workout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: DayOfWeek,
  })
  day: DayOfWeek;

  @Column({
    type: 'enum',
    enum: WorkoutType,
    default: WorkoutType.REST,
  })
  type: WorkoutType;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  hours: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => UserInput, (userInput) => userInput.workouts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_input_id' })
  userInput: UserInput;

  @Column({ name: 'user_input_id' })
  userInputId: string;
}

