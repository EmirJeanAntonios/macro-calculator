import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MacroCalculatorService } from './macro-calculator.service';
import { CalculateMacrosDto } from './dto';

@Controller()
export class MacroCalculatorController {
  constructor(private readonly macroCalculatorService: MacroCalculatorService) {}

  /**
   * POST /api/calculate
   * Calculate macros based on user input and workout schedule
   */
  @Post('calculate')
  async calculateMacros(@Body() dto: CalculateMacrosDto) {
    const result = await this.macroCalculatorService.calculateMacros(dto);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * GET /api/macros/:id
   * Get saved macro results by ID
   */
  @Get('macros/:id')
  async getResult(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.macroCalculatorService.getResultById(id);
    
    if (!result) {
      throw new NotFoundException(`Macro result with ID "${id}" not found`);
    }

    return {
      success: true,
      data: result,
    };
  }
}

