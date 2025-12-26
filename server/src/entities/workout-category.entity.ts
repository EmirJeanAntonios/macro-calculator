import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('workout_categories')
export class WorkoutCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string; // e.g., 'boxing', 'swimming'

  @Column()
  name: string; // Display name, e.g., 'Boxing', 'Swimming'

  @Column('decimal', { precision: 4, scale: 2, default: 1.0 })
  intensity: number; // Intensity multiplier (0.5 - 2.0)

  @Column({ nullable: true })
  icon: string; // Icon name from lucide-react

  @Column({ nullable: true })
  color: string; // Color class, e.g., 'blue', 'red'

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDefault: boolean; // Cannot be deleted if true

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


