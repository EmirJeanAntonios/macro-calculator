import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Admin, Configuration, MacroResult } from '../../entities';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Configuration, MacroResult]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'macro-calculator-secret-key'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, JwtStrategy],
  exports: [AdminService],
})
export class AdminModule {}

