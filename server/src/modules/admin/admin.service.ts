import { Injectable, UnauthorizedException, OnModuleInit, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Admin, Configuration, ConfigCategory, MacroResult, WorkoutCategory } from '../../entities';
import { LoginDto, UpdateConfigDto, CreateWorkoutCategoryDto, UpdateWorkoutCategoryDto } from './dto';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Configuration)
    private configRepository: Repository<Configuration>,
    @InjectRepository(MacroResult)
    private macroResultRepository: Repository<MacroResult>,
    @InjectRepository(WorkoutCategory)
    private workoutCategoryRepository: Repository<WorkoutCategory>,
    private jwtService: JwtService,
  ) {}

  /**
   * Initialize default admin, configurations, and workout categories on module start
   */
  async onModuleInit() {
    await this.seedDefaultAdmin();
    await this.seedDefaultConfigurations();
    await this.seedDefaultWorkoutCategories();
  }

  /**
   * Create default admin if none exists
   */
  private async seedDefaultAdmin() {
    const adminCount = await this.adminRepository.count();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.adminRepository.save({
        username: 'admin',
        password: hashedPassword,
      });
      console.log('Default admin created: username=admin, password=admin123');
    }
  }

  /**
   * Seed default configurations if none exist
   */
  private async seedDefaultConfigurations() {
    const configCount = await this.configRepository.count();
    if (configCount > 0) return;

    const defaultConfigs = [
      // Activity Level Thresholds
      { key: 'activity_sedentary', value: 1.2, category: ConfigCategory.ACTIVITY_LEVEL, label: 'Sedentary Multiplier', description: 'Little to no exercise' },
      { key: 'activity_light', value: 1.375, category: ConfigCategory.ACTIVITY_LEVEL, label: 'Light Activity Multiplier', description: 'Light exercise 1-3 days/week' },
      { key: 'activity_moderate', value: 1.55, category: ConfigCategory.ACTIVITY_LEVEL, label: 'Moderate Activity Multiplier', description: 'Moderate exercise 3-5 days/week' },
      { key: 'activity_very_active', value: 1.725, category: ConfigCategory.ACTIVITY_LEVEL, label: 'Very Active Multiplier', description: 'Hard exercise 6-7 days/week' },
      { key: 'activity_extra_active', value: 1.9, category: ConfigCategory.ACTIVITY_LEVEL, label: 'Extra Active Multiplier', description: 'Very hard exercise, physical job' },
      { key: 'activity_athlete', value: 2.0, category: ConfigCategory.ACTIVITY_LEVEL, label: 'Athlete Multiplier', description: 'Intense training twice daily' },

      // Goal Calorie Adjustments
      { key: 'goal_weight_loss', value: 0.8, category: ConfigCategory.GOAL_ADJUSTMENT, label: 'Weight Loss Multiplier', description: '20% calorie deficit' },
      { key: 'goal_maintenance', value: 1.0, category: ConfigCategory.GOAL_ADJUSTMENT, label: 'Maintenance Multiplier', description: 'Maintain current weight' },
      { key: 'goal_muscle_gain', value: 1.1, category: ConfigCategory.GOAL_ADJUSTMENT, label: 'Muscle Gain Multiplier', description: '10% calorie surplus' },

      // Macro Ratios (as percentages)
      { key: 'macro_protein_weight_loss', value: 0.35, category: ConfigCategory.MACRO_RATIO, label: 'Protein Ratio (Weight Loss)', description: '35% of calories from protein' },
      { key: 'macro_fat_weight_loss', value: 0.30, category: ConfigCategory.MACRO_RATIO, label: 'Fat Ratio (Weight Loss)', description: '30% of calories from fat' },
      { key: 'macro_protein_muscle_gain', value: 0.30, category: ConfigCategory.MACRO_RATIO, label: 'Protein Ratio (Muscle Gain)', description: '30% of calories from protein' },
      { key: 'macro_fat_muscle_gain', value: 0.25, category: ConfigCategory.MACRO_RATIO, label: 'Fat Ratio (Muscle Gain)', description: '25% of calories from fat' },
      { key: 'macro_protein_maintenance', value: 0.25, category: ConfigCategory.MACRO_RATIO, label: 'Protein Ratio (Maintenance)', description: '25% of calories from protein' },
      { key: 'macro_fat_maintenance', value: 0.30, category: ConfigCategory.MACRO_RATIO, label: 'Fat Ratio (Maintenance)', description: '30% of calories from fat' },
      { key: 'macro_min_protein_per_kg', value: 1.6, category: ConfigCategory.MACRO_RATIO, label: 'Min Protein per kg', description: 'Minimum grams of protein per kg body weight' },

      // Special Day Adjustments
      { key: 'workout_day_multiplier', value: 1.1, category: ConfigCategory.SPECIAL_DAY, label: 'Workout Day Calorie Boost', description: '10% more calories on workout days' },
      { key: 'rest_day_multiplier', value: 0.9, category: ConfigCategory.SPECIAL_DAY, label: 'Rest Day Calorie Reduction', description: '10% fewer calories on rest days' },
      { key: 'workout_day_protein_per_kg', value: 2.0, category: ConfigCategory.SPECIAL_DAY, label: 'Workout Day Protein (g/kg)', description: 'Protein per kg on workout days' },
      { key: 'rest_day_protein_per_kg', value: 1.8, category: ConfigCategory.SPECIAL_DAY, label: 'Rest Day Protein (g/kg)', description: 'Protein per kg on rest days' },
      { key: 'workout_day_fat_ratio', value: 0.25, category: ConfigCategory.SPECIAL_DAY, label: 'Workout Day Fat Ratio', description: '25% of calories from fat on workout days' },
      { key: 'rest_day_fat_ratio', value: 0.35, category: ConfigCategory.SPECIAL_DAY, label: 'Rest Day Fat Ratio', description: '35% of calories from fat on rest days' },
    ];

    await this.configRepository.save(defaultConfigs);
    console.log('Default configurations seeded');
  }

  /**
   * Seed default workout categories if none exist
   */
  private async seedDefaultWorkoutCategories() {
    const count = await this.workoutCategoryRepository.count();
    if (count > 0) return;

    const defaultCategories = [
      { key: 'rest', name: 'Rest Day', intensity: 0, icon: 'Moon', color: 'slate', description: 'No exercise', sortOrder: 0, isDefault: true },
      { key: 'walking', name: 'Walking', intensity: 0.5, icon: 'Footprints', color: 'green', description: 'Light activity (~3.5 METs)', sortOrder: 1, isDefault: true },
      { key: 'yoga', name: 'Yoga', intensity: 0.6, icon: 'Sparkles', color: 'purple', description: 'Light to moderate (~3-4 METs)', sortOrder: 2, isDefault: true },
      { key: 'pilates', name: 'Pilates', intensity: 0.7, icon: 'PersonStanding', color: 'pink', description: 'Moderate (~4 METs)', sortOrder: 3, isDefault: true },
      { key: 'cycling', name: 'Cycling', intensity: 0.9, icon: 'Bike', color: 'lime', description: 'Moderate to vigorous (~6-8 METs)', sortOrder: 4, isDefault: true },
      { key: 'dance', name: 'Dance', intensity: 0.9, icon: 'Music', color: 'fuchsia', description: 'Moderate to vigorous (~5-8 METs)', sortOrder: 5, isDefault: true },
      { key: 'swimming', name: 'Swimming', intensity: 1.0, icon: 'Waves', color: 'cyan', description: 'Moderate to vigorous (~6-10 METs)', sortOrder: 6, isDefault: true },
      { key: 'strength', name: 'Strength', intensity: 1.0, icon: 'Dumbbell', color: 'blue', description: 'Moderate (~5-6 METs)', sortOrder: 7, isDefault: true },
      { key: 'cardio', name: 'Cardio', intensity: 1.1, icon: 'Heart', color: 'red', description: 'Vigorous (~7-10 METs)', sortOrder: 8, isDefault: true },
      { key: 'running', name: 'Running', intensity: 1.2, icon: 'Footprints', color: 'orange', description: 'Vigorous (~8-12 METs)', sortOrder: 9, isDefault: true },
      { key: 'climbing', name: 'Climbing', intensity: 1.2, icon: 'Mountain', color: 'stone', description: 'Vigorous (~8-11 METs)', sortOrder: 10, isDefault: true },
      { key: 'sports', name: 'Sports', intensity: 1.2, icon: 'Trophy', color: 'amber', description: 'Variable (~6-12 METs)', sortOrder: 11, isDefault: true },
      { key: 'martial_arts', name: 'Martial Arts', intensity: 1.4, icon: 'Swords', color: 'zinc', description: 'Very vigorous (~10-12 METs)', sortOrder: 12, isDefault: true },
      { key: 'boxing', name: 'Boxing', intensity: 1.5, icon: 'Hand', color: 'rose', description: 'Very vigorous (~10-13 METs)', sortOrder: 13, isDefault: true },
      { key: 'hiit', name: 'HIIT', intensity: 1.6, icon: 'Zap', color: 'yellow', description: 'Extreme (~12-15 METs)', sortOrder: 14, isDefault: true },
      { key: 'crossfit', name: 'CrossFit', intensity: 1.7, icon: 'Flame', color: 'orange', description: 'Extreme (~12-16 METs)', sortOrder: 15, isDefault: true },
      { key: 'other', name: 'Other', intensity: 1.0, icon: 'MoreHorizontal', color: 'gray', description: 'Custom workout', sortOrder: 99, isDefault: true },
    ];

    await this.workoutCategoryRepository.save(defaultCategories);
    console.log('Default workout categories seeded');
  }

  // ============ AUTHENTICATION ============

  async login(dto: LoginDto): Promise<{ accessToken: string; admin: { id: string; username: string } }> {
    const admin = await this.adminRepository.findOne({
      where: { username: dto.username, isActive: true },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: admin.id, username: admin.username };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      admin: { id: admin.id, username: admin.username },
    };
  }

  // ============ RECORDS MANAGEMENT ============

  async getAllRecords(page = 1, limit = 20) {
    const [records, total] = await this.macroResultRepository.findAndCount({
      relations: ['userInput', 'userInput.workouts'],
      order: { calculatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRecordById(id: string) {
    return this.macroResultRepository.findOne({
      where: { id },
      relations: ['userInput', 'userInput.workouts'],
    });
  }

  async deleteRecord(id: string) {
    const result = await this.macroResultRepository.delete(id);
    return { deleted: (result.affected ?? 0) > 0 };
  }

  // ============ CONFIGURATIONS ============

  async getAllConfigurations() {
    const configs = await this.configRepository.find({
      order: { category: 'ASC', key: 'ASC' },
    });

    const grouped = configs.reduce((acc, config) => {
      if (!acc[config.category]) {
        acc[config.category] = [];
      }
      acc[config.category].push(config);
      return acc;
    }, {} as Record<string, Configuration[]>);

    return grouped;
  }

  async updateConfigurations(dto: UpdateConfigDto) {
    for (const item of dto.configs) {
      await this.configRepository.update(
        { key: item.key },
        { value: item.value },
      );
    }
    return this.getAllConfigurations();
  }

  async getConfigValue(key: string): Promise<number> {
    const config = await this.configRepository.findOne({ where: { key } });
    return config ? Number(config.value) : 0;
  }

  async getConfigMap(): Promise<Record<string, number>> {
    const configs = await this.configRepository.find();
    return configs.reduce((acc, c) => {
      acc[c.key] = Number(c.value);
      return acc;
    }, {} as Record<string, number>);
  }

  // ============ WORKOUT CATEGORIES ============

  async getAllWorkoutCategories(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    return this.workoutCategoryRepository.find({
      where,
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async getWorkoutCategoryByKey(key: string) {
    return this.workoutCategoryRepository.findOne({ where: { key } });
  }

  async createWorkoutCategory(dto: CreateWorkoutCategoryDto) {
    // Check if key already exists
    const existing = await this.workoutCategoryRepository.findOne({ where: { key: dto.key } });
    if (existing) {
      throw new ConflictException(`Workout category with key "${dto.key}" already exists`);
    }

    const category = this.workoutCategoryRepository.create({
      ...dto,
      isDefault: false,
    });
    return this.workoutCategoryRepository.save(category);
  }

  async updateWorkoutCategory(id: string, dto: UpdateWorkoutCategoryDto) {
    const category = await this.workoutCategoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Workout category with ID "${id}" not found`);
    }

    Object.assign(category, dto);
    return this.workoutCategoryRepository.save(category);
  }

  async deleteWorkoutCategory(id: string) {
    const category = await this.workoutCategoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Workout category with ID "${id}" not found`);
    }

    if (category.isDefault) {
      throw new ConflictException('Cannot delete default workout categories');
    }

    const result = await this.workoutCategoryRepository.delete(id);
    return { deleted: (result.affected ?? 0) > 0 };
  }

  async getWorkoutIntensityMap(): Promise<Record<string, number>> {
    const categories = await this.workoutCategoryRepository.find({
      where: { isActive: true },
    });
    return categories.reduce((acc, c) => {
      acc[c.key] = Number(c.intensity);
      return acc;
    }, {} as Record<string, number>);
  }
}
