import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MacroCalculatorController } from './macro-calculator.controller';
import { MacroCalculatorService } from './macro-calculator.service';
import { PdfService } from './pdf.service';
import { UserInput, Workout, MacroResult, Configuration, WorkoutCategory } from '../../entities';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserInput, Workout, MacroResult, Configuration, WorkoutCategory]),
    forwardRef(() => AdminModule),
  ],
  controllers: [MacroCalculatorController],
  providers: [MacroCalculatorService, PdfService],
  exports: [MacroCalculatorService, PdfService],
})
export class MacroCalculatorModule {}

