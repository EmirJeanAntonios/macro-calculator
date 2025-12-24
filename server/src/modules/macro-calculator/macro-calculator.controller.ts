import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Res,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { MacroCalculatorService } from './macro-calculator.service';
import { PdfService } from './pdf.service';
import { CalculateMacrosDto } from './dto';

@Controller()
export class MacroCalculatorController {
  constructor(
    private readonly macroCalculatorService: MacroCalculatorService,
    private readonly pdfService: PdfService,
  ) {}

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

  /**
   * GET /api/pdf/:id
   * Generate and download PDF for macro results
   */
  @Get('pdf/:id')
  async downloadPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const result = await this.macroCalculatorService.getResultById(id);

    if (!result) {
      throw new NotFoundException(`Macro result with ID "${id}" not found`);
    }

    // Generate PDF
    const doc = this.pdfService.generateMacroPdf(
      result,
      result.userInput,
      result.userInput.workouts,
    );

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="macro-results-${id}.pdf"`,
    );

    // Pipe the PDF to response
    doc.pipe(res);
    doc.end();
  }
}

