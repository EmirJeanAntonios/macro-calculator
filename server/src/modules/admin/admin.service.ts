import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Admin, Configuration, ConfigCategory, MacroResult } from '../../entities';
import { LoginDto, UpdateConfigDto } from './dto';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Configuration)
    private configRepository: Repository<Configuration>,
    @InjectRepository(MacroResult)
    private macroResultRepository: Repository<MacroResult>,
    private jwtService: JwtService,
  ) {}

  /**
   * Initialize default admin and configurations on module start
   */
  async onModuleInit() {
    await this.seedDefaultAdmin();
    await this.seedDefaultConfigurations();
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
      // Workout Intensity Multipliers
      { key: 'intensity_walking', value: 0.5, category: ConfigCategory.WORKOUT_INTENSITY, label: 'Walking', description: 'Light activity (~3.5 METs)' },
      { key: 'intensity_yoga', value: 0.6, category: ConfigCategory.WORKOUT_INTENSITY, label: 'Yoga', description: 'Light to moderate (~3-4 METs)' },
      { key: 'intensity_pilates', value: 0.7, category: ConfigCategory.WORKOUT_INTENSITY, label: 'Pilates', description: 'Moderate (~4 METs)' },
      { key: 'intensity_cycling', value: 0.9, category: ConfigCategory.WORKOUT_INTENSITY, label: 'Cycling', description: 'Moderate to vigorous (~6-8 METs)' },
      { key: 'intensity_dance', value: 0.9, category: ConfigCategory.WORKOUT_INTENSITY, label: 'Dance', description: 'Moderate to vigorous (~5-8 METs)' },
      { key: 'intensity_swimming', value: 1.0, category: ConfigCategory.WORKOUT_INTENSITY, label: 'Swimming', description: 'Moderate to vigorous (~6-10 METs)' },
      { key: 'intensity_strength', value: 1.0, category: ConfigCategory.WORKOUT_INTENSITY, label: 'Strength', description: 'Moderate (~5-6 METs)' },
      { key: 'intensity_cardio', value: 1.1, category: ConfigCategory.WORKOUT_INTENSITY, label: 'Cardio', description: 'Vigorous (~7-10 METs)' },
      { key: 'intensity_running', value: 1.2, category: ConfigCategory.WORKOUT_INTENSITY, label: 'Running', description: 'Vigorous (~8-12 METs)' },
      { key: 'intensity_climbing', value: 1.2, category: ConfigCategory.WORKOUT_INTENSITY, label: 'Climbing', description: 'Vigorous (~8-11 METs)' },
      { key: 'intensity_sports', value: 1.2, category: ConfigCategory.WORKOUT_INTENSITY, label: 'Sports', description: 'Variable (~6-12 METs)' },
      { key: 'intensity_martial_arts', value: 1.4, category: ConfigCategory.WORKOUT_INTENSITY, label: 'Martial Arts', description: 'Very vigorous (~10-12 METs)' },
      { key: 'intensity_boxing', value: 1.5, category: ConfigCategory.WORKOUT_INTENSITY, label: 'Boxing', description: 'Very vigorous (~10-13 METs)' },
      { key: 'intensity_hiit', value: 1.6, category: ConfigCategory.WORKOUT_INTENSITY, label: 'HIIT', description: 'Extreme (~12-15 METs)' },
      { key: 'intensity_crossfit', value: 1.7, category: ConfigCategory.WORKOUT_INTENSITY, label: 'CrossFit', description: 'Extreme (~12-16 METs)' },
      { key: 'intensity_other', value: 1.0, category: ConfigCategory.WORKOUT_INTENSITY, label: 'Other', description: 'Default moderate intensity' },

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
   * Admin login
   */
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

  /**
   * Get all records with pagination
   */
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

  /**
   * Get a single record by ID
   */
  async getRecordById(id: string) {
    return this.macroResultRepository.findOne({
      where: { id },
      relations: ['userInput', 'userInput.workouts'],
    });
  }

  /**
   * Delete a record
   */
  async deleteRecord(id: string) {
    const result = await this.macroResultRepository.delete(id);
    return { deleted: (result.affected ?? 0) > 0 };
  }

  /**
   * Get all configurations grouped by category
   */
  async getAllConfigurations() {
    const configs = await this.configRepository.find({
      order: { category: 'ASC', key: 'ASC' },
    });

    // Group by category
    const grouped = configs.reduce((acc, config) => {
      if (!acc[config.category]) {
        acc[config.category] = [];
      }
      acc[config.category].push(config);
      return acc;
    }, {} as Record<string, Configuration[]>);

    return grouped;
  }

  /**
   * Update configurations
   */
  async updateConfigurations(dto: UpdateConfigDto) {
    for (const item of dto.configs) {
      await this.configRepository.update(
        { key: item.key },
        { value: item.value },
      );
    }
    return this.getAllConfigurations();
  }

  /**
   * Get a configuration value by key
   */
  async getConfigValue(key: string): Promise<number> {
    const config = await this.configRepository.findOne({ where: { key } });
    return config ? Number(config.value) : 0;
  }

  /**
   * Get all config values as a map
   */
  async getConfigMap(): Promise<Record<string, number>> {
    const configs = await this.configRepository.find();
    return configs.reduce((acc, c) => {
      acc[c.key] = Number(c.value);
      return acc;
    }, {} as Record<string, number>);
  }
}

