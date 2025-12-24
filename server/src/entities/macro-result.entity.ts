import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { UserInput } from './user-input.entity';

@Entity('macro_results')
export class MacroResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Base calculations
  @Column({ type: 'int' })
  bmr: number; // Basal Metabolic Rate

  @Column({ type: 'int' })
  tdee: number; // Total Daily Energy Expenditure

  // Regular day macros
  @Column({ type: 'int' })
  dailyCalories: number;

  @Column({ type: 'int' })
  protein: number; // grams

  @Column({ type: 'int' })
  carbs: number; // grams

  @Column({ type: 'int' })
  fats: number; // grams

  // Workout day macros (special occasion)
  @Column({ type: 'int', nullable: true })
  workoutDayCalories: number;

  @Column({ type: 'int', nullable: true })
  workoutDayProtein: number;

  @Column({ type: 'int', nullable: true })
  workoutDayCarbs: number;

  @Column({ type: 'int', nullable: true })
  workoutDayFats: number;

  // Rest day macros (special occasion)
  @Column({ type: 'int', nullable: true })
  restDayCalories: number;

  @Column({ type: 'int', nullable: true })
  restDayProtein: number;

  @Column({ type: 'int', nullable: true })
  restDayCarbs: number;

  @Column({ type: 'int', nullable: true })
  restDayFats: number;

  // Relationship
  @OneToOne(() => UserInput, (userInput) => userInput.macroResult, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_input_id' })
  userInput: UserInput;

  @Column({ name: 'user_input_id' })
  userInputId: string;

  @CreateDateColumn()
  calculatedAt: Date;
}

