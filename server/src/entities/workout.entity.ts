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

// Keep enum for backwards compatibility but type field is now a string
export enum WorkoutType {
  REST = 'rest',
  CARDIO = 'cardio',
  STRENGTH = 'strength',
  HIIT = 'hiit',
  YOGA = 'yoga',
  SPORTS = 'sports',
  RUNNING = 'running',
  CYCLING = 'cycling',
  SWIMMING = 'swimming',
  PILATES = 'pilates',
  CROSSFIT = 'crossfit',
  BOXING = 'boxing',
  DANCE = 'dance',
  WALKING = 'walking',
  CLIMBING = 'climbing',
  MARTIAL_ARTS = 'martial_arts',
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

  @Column({ type: 'varchar', length: 50, default: 'rest' })
  type: string; // Now a dynamic string to support custom workout types

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
