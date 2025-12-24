import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MacroCalculatorController } from './macro-calculator.controller';
import { MacroCalculatorService } from './macro-calculator.service';
import { UserInput, Workout, MacroResult } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([UserInput, Workout, MacroResult])],
  controllers: [MacroCalculatorController],
  providers: [MacroCalculatorService],
  exports: [MacroCalculatorService],
})
export class MacroCalculatorModule {}

