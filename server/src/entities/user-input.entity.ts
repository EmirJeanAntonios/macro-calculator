import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Workout } from './workout.entity';
import { MacroResult } from './macro-result.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum Goal {
  WEIGHT_LOSS = 'weight_loss',
  MAINTENANCE = 'maintenance',
  MUSCLE_GAIN = 'muscle_gain',
}

export enum WeightUnit {
  KG = 'kg',
  LBS = 'lbs',
}

export enum HeightUnit {
  CM = 'cm',
  FT = 'ft',
}

@Entity('user_inputs')
export class UserInput {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  age: number;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number;

  @Column({
    type: 'enum',
    enum: WeightUnit,
    default: WeightUnit.KG,
  })
  weightUnit: WeightUnit;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  height: number;

  @Column({
    type: 'enum',
    enum: HeightUnit,
    default: HeightUnit.CM,
  })
  heightUnit: HeightUnit;

  @Column({
    type: 'enum',
    enum: Goal,
  })
  goal: Goal;

  @OneToMany(() => Workout, (workout) => workout.userInput, { cascade: true })
  workouts: Workout[];

  @OneToOne(() => MacroResult, (macroResult) => macroResult.userInput, {
    cascade: true,
  })
  macroResult: MacroResult;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

