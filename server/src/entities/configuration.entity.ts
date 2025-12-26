import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ConfigCategory {
  WORKOUT_INTENSITY = 'workout_intensity',
  ACTIVITY_LEVEL = 'activity_level',
  GOAL_ADJUSTMENT = 'goal_adjustment',
  MACRO_RATIO = 'macro_ratio',
  SPECIAL_DAY = 'special_day',
}

@Entity('configurations')
export class Configuration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column('decimal', { precision: 10, scale: 4 })
  value: number;

  @Column({
    type: 'enum',
    enum: ConfigCategory,
  })
  category: ConfigCategory;

  @Column()
  label: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

