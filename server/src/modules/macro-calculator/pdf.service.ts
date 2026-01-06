import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { MacroResult, UserInput, Workout, Goal } from '../../entities';

@Injectable()
export class PdfService {
  // Design tokens matching web UI (adapted for print)
  private readonly colors = {
    // For PDF we use light mode (printable)
    background: '#ffffff',
    surface: '#fafafa',
    surfaceMuted: '#f4f4f5',
    
    // Borders
    borderSubtle: '#e4e4e7',
    borderDefault: '#d4d4d8',
    
    // Text
    textPrimary: '#09090b',
    textSecondary: '#52525b',
    textMuted: '#71717a',
    
    // Accent (green)
    accent: '#22c55e',
    accentMuted: '#16a34a',
    
    // Macro colors (same as web)
    protein: '#6366f1',
    carbs: '#f59e0b',
    fats: '#f472b6',
  };

  private readonly pageMargin = 40;
  private pageWidth: number;
  private contentWidth: number;

  /**
   * Generate a PDF that matches the web ResultsPage UI
   */
  generateMacroPdf(
    macroResult: MacroResult,
    userInput: UserInput,
    workouts: Workout[],
  ): PDFKit.PDFDocument {
    const doc = new PDFDocument({
      size: 'A4',
      margin: this.pageMargin,
      info: {
        Title: 'Macro Calculator - Your Nutrition Plan',
        Author: 'Macro Calculator',
      },
    });

    this.pageWidth = doc.page.width;
    this.contentWidth = this.pageWidth - this.pageMargin * 2;

    // Calculate percentages (matching web logic)
    const proteinCals = macroResult.protein * 4;
    const carbsCals = macroResult.carbs * 4;
    const fatsCals = macroResult.fats * 9;
    const totalCals = proteinCals + carbsCals + fatsCals;
    const pct = {
      protein: Math.round((proteinCals / totalCals) * 100),
      carbs: Math.round((carbsCals / totalCals) * 100),
      fats: Math.round((fatsCals / totalCals) * 100),
    };

    // ================================================
    // HEADER (matches web header)
    // ================================================
    this.drawHeader(doc);

    // ================================================
    // PRIMARY CARD: Daily Calories
    // ================================================
    let y = doc.y;
    y = this.drawPrimaryCard(doc, y, macroResult, pct);

    // ================================================
    // MACRO BREAKDOWN: 3-column grid
    // ================================================
    y = this.drawMacroCards(doc, y + 16, macroResult, pct);

    // ================================================
    // WORKOUT / REST DAY CARDS: 2-column grid
    // ================================================
    if (macroResult.workoutDayCalories && macroResult.restDayCalories) {
      y = this.drawDayCards(doc, y + 16, macroResult);
    }

    // ================================================
    // USER PROFILE SUMMARY
    // ================================================
    y = this.drawProfileSection(doc, y + 16, userInput);

    // ================================================
    // WEEKLY SCHEDULE
    // ================================================
    y = this.drawWeeklySchedule(doc, y + 16, workouts);

    // ================================================
    // FOOTER
    // ================================================
    this.drawFooter(doc);

    return doc;
  }

  /**
   * Header: Macro Calculator branding
   */
  private drawHeader(doc: PDFKit.PDFDocument): void {
    const y = this.pageMargin;

    // Logo/Brand
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor(this.colors.textPrimary)
      .text('Macro Calculator', this.pageMargin, y);

    // Subtitle
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(this.colors.textMuted)
      .text('Your Personalized Nutrition Plan', this.pageMargin, y + 20);

    // Horizontal line
    doc
      .moveTo(this.pageMargin, y + 40)
      .lineTo(this.pageMargin + this.contentWidth, y + 40)
      .strokeColor(this.colors.borderSubtle)
      .lineWidth(1)
      .stroke();

    doc.y = y + 55;
  }

  /**
   * Primary Card: Daily calories with BMR/TDEE on right, macro bar below
   */
  private drawPrimaryCard(
    doc: PDFKit.PDFDocument,
    startY: number,
    result: MacroResult,
    pct: { protein: number; carbs: number; fats: number },
  ): number {
    const cardX = this.pageMargin;
    const cardWidth = this.contentWidth;
    const cardHeight = 90;
    const padding = 16;

    // Card background
    this.drawRoundedRect(doc, cardX, startY, cardWidth, cardHeight, 8, this.colors.surface);

    // Card border
    doc
      .roundedRect(cardX, startY, cardWidth, cardHeight, 8)
      .strokeColor(this.colors.borderSubtle)
      .lineWidth(1)
      .stroke();

    // "DAILY TARGET" label
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(this.colors.textMuted)
      .text('DAILY TARGET', cardX + padding, startY + padding, { characterSpacing: 0.5 });

    // Large calories number
    doc
      .fontSize(32)
      .font('Helvetica-Bold')
      .fillColor(this.colors.textPrimary)
      .text(`${result.dailyCalories}`, cardX + padding, startY + padding + 14, { continued: true })
      .fontSize(11)
      .font('Helvetica')
      .fillColor(this.colors.textMuted)
      .text(' kcal/day');

    // BMR/TDEE on right side
    const rightX = cardX + cardWidth - padding - 50;
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(this.colors.textMuted)
      .text('BMR', rightX, startY + padding, { width: 50, align: 'right' });

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor(this.colors.textSecondary)
      .text(`${result.bmr}`, rightX, startY + padding + 10, { width: 50, align: 'right' });

    doc
      .fontSize(8)
      .fillColor(this.colors.textMuted)
      .text('TDEE', rightX, startY + padding + 28, { width: 50, align: 'right' });

    doc
      .fontSize(10)
      .fillColor(this.colors.textSecondary)
      .text(`${result.tdee}`, rightX, startY + padding + 38, { width: 50, align: 'right' });

    // Macro distribution bar (matching web exactly)
    const barY = startY + cardHeight - padding - 8;
    const barHeight = 6;
    const barWidth = cardWidth - padding * 2;
    const barX = cardX + padding;

    // Bar background
    doc.roundedRect(barX, barY, barWidth, barHeight, 3).fill(this.colors.surfaceMuted);

    // Protein segment
    const proteinWidth = (pct.protein / 100) * barWidth;
    doc.rect(barX, barY, proteinWidth, barHeight).fill(this.colors.protein);

    // Carbs segment
    const carbsWidth = (pct.carbs / 100) * barWidth;
    doc.rect(barX + proteinWidth, barY, carbsWidth, barHeight).fill(this.colors.carbs);

    // Fats segment
    const fatsWidth = (pct.fats / 100) * barWidth;
    doc.rect(barX + proteinWidth + carbsWidth, barY, fatsWidth, barHeight).fill(this.colors.fats);

    return startY + cardHeight;
  }

  /**
   * Macro Cards: 3-column grid (Protein, Carbs, Fats)
   */
  private drawMacroCards(
    doc: PDFKit.PDFDocument,
    startY: number,
    result: MacroResult,
    pct: { protein: number; carbs: number; fats: number },
  ): number {
    const gap = 12;
    const cardWidth = (this.contentWidth - gap * 2) / 3;
    const cardHeight = 80;

    const macros = [
      { label: 'Protein', value: result.protein, percentage: pct.protein, color: this.colors.protein },
      { label: 'Carbs', value: result.carbs, percentage: pct.carbs, color: this.colors.carbs },
      { label: 'Fats', value: result.fats, percentage: pct.fats, color: this.colors.fats },
    ];

    macros.forEach((macro, i) => {
      const x = this.pageMargin + i * (cardWidth + gap);
      this.drawMacroCard(doc, x, startY, cardWidth, cardHeight, macro);
    });

    return startY + cardHeight;
  }

  /**
   * Single Macro Card
   */
  private drawMacroCard(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    width: number,
    height: number,
    macro: { label: string; value: number; percentage: number; color: string },
  ): void {
    const padding = 12;

    // Card background
    this.drawRoundedRect(doc, x, y, width, height, 6, this.colors.surface);

    // Card border
    doc.roundedRect(x, y, width, height, 6).strokeColor(this.colors.borderSubtle).lineWidth(1).stroke();

    // Label
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(this.colors.textMuted)
      .text(macro.label, x + padding, y + padding);

    // Value
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor(macro.color)
      .text(`${macro.value}`, x + padding, y + padding + 12, { continued: true })
      .fontSize(9)
      .font('Helvetica')
      .fillColor(this.colors.textMuted)
      .text('g');

    // Progress bar background
    const barY = y + height - padding - 14;
    const barWidth = width - padding * 2;
    doc.roundedRect(x + padding, barY, barWidth, 4, 2).fill(this.colors.surfaceMuted);

    // Progress bar fill
    doc.roundedRect(x + padding, barY, (macro.percentage / 100) * barWidth, 4, 2).fill(macro.color);

    // Percentage
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(this.colors.textMuted)
      .text(`${macro.percentage}%`, x + padding, barY + 8);
  }

  /**
   * Day Cards: Workout and Rest Day (2-column grid)
   */
  private drawDayCards(doc: PDFKit.PDFDocument, startY: number, result: MacroResult): number {
    const gap = 12;
    const cardWidth = (this.contentWidth - gap) / 2;
    const cardHeight = 75;

    // Workout Day
    this.drawDayCard(doc, this.pageMargin, startY, cardWidth, cardHeight, {
      title: 'Workout Day',
      calories: result.workoutDayCalories!,
      protein: result.workoutDayProtein!,
      carbs: result.workoutDayCarbs!,
      fats: result.workoutDayFats!,
      isWorkout: true,
    });

    // Rest Day
    this.drawDayCard(doc, this.pageMargin + cardWidth + gap, startY, cardWidth, cardHeight, {
      title: 'Rest Day',
      calories: result.restDayCalories!,
      protein: result.restDayProtein!,
      carbs: result.restDayCarbs!,
      fats: result.restDayFats!,
      isWorkout: false,
    });

    return startY + cardHeight;
  }

  /**
   * Single Day Card
   */
  private drawDayCard(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    width: number,
    height: number,
    day: { title: string; calories: number; protein: number; carbs: number; fats: number; isWorkout: boolean },
  ): void {
    const padding = 12;

    // Card background
    this.drawRoundedRect(doc, x, y, width, height, 6, this.colors.surface);

    // Card border (accent for workout day)
    doc
      .roundedRect(x, y, width, height, 6)
      .strokeColor(day.isWorkout ? this.colors.accent : this.colors.borderSubtle)
      .lineWidth(day.isWorkout ? 1.5 : 1)
      .stroke();

    // Title
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(this.colors.textMuted)
      .text(day.title, x + padding, y + padding);

    // Calories
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor(this.colors.textPrimary)
      .text(`${day.calories}`, x + padding, y + padding + 12, { continued: true })
      .fontSize(8)
      .font('Helvetica')
      .fillColor(this.colors.textMuted)
      .text(' kcal');

    // Macro breakdown (P / C / F)
    const macroY = y + height - padding - 8;
    const colWidth = (width - padding * 2) / 3;

    // Protein
    doc.fontSize(8).fillColor(this.colors.textMuted).text('P', x + padding, macroY);
    doc.fillColor(this.colors.textSecondary).text(`${day.protein}g`, x + padding + 10, macroY);

    // Carbs
    doc.fillColor(this.colors.textMuted).text('C', x + padding + colWidth, macroY);
    doc.fillColor(this.colors.textSecondary).text(`${day.carbs}g`, x + padding + colWidth + 10, macroY);

    // Fats
    doc.fillColor(this.colors.textMuted).text('F', x + padding + colWidth * 2, macroY);
    doc.fillColor(this.colors.textSecondary).text(`${day.fats}g`, x + padding + colWidth * 2 + 10, macroY);
  }

  /**
   * Profile Section: User info in compact format
   */
  private drawProfileSection(doc: PDFKit.PDFDocument, startY: number, userInput: UserInput): number {
    const cardX = this.pageMargin;
    const cardWidth = this.contentWidth;
    const cardHeight = 50;
    const padding = 12;

    // Card background
    this.drawRoundedRect(doc, cardX, startY, cardWidth, cardHeight, 6, this.colors.surface);
    doc.roundedRect(cardX, startY, cardWidth, cardHeight, 6).strokeColor(this.colors.borderSubtle).lineWidth(1).stroke();

    // Section label
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(this.colors.textMuted)
      .text('PROFILE', cardX + padding, startY + padding, { characterSpacing: 0.5 });

    // Profile info in single line
    const profileInfo = [
      `${userInput.age} years`,
      this.capitalize(userInput.gender),
      `${userInput.weight} ${userInput.weightUnit}`,
      `${userInput.height} ${userInput.heightUnit}`,
      this.formatGoal(userInput.goal),
    ].join('   •   ');

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor(this.colors.textSecondary)
      .text(profileInfo, cardX + padding, startY + padding + 16);

    return startY + cardHeight;
  }

  /**
   * Weekly Schedule: 7-column grid
   */
  private drawWeeklySchedule(doc: PDFKit.PDFDocument, startY: number, workouts: Workout[]): number {
    const cardX = this.pageMargin;
    const cardWidth = this.contentWidth;
    const cardHeight = 65;
    const padding = 12;

    // Card background
    this.drawRoundedRect(doc, cardX, startY, cardWidth, cardHeight, 6, this.colors.surface);
    doc.roundedRect(cardX, startY, cardWidth, cardHeight, 6).strokeColor(this.colors.borderSubtle).lineWidth(1).stroke();

    // Section label
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(this.colors.textMuted)
      .text('WEEKLY SCHEDULE', cardX + padding, startY + padding, { characterSpacing: 0.5 });

    // Days grid
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayWidth = (cardWidth - padding * 2) / 7;
    const dayY = startY + padding + 18;

    days.forEach((day, i) => {
      const x = cardX + padding + i * dayWidth;
      const workout = workouts.find((w) => w.day === day);
      const isRest = !workout || workout.type === 'rest';

      // Day abbreviation
      doc
        .fontSize(7)
        .font('Helvetica')
        .fillColor(this.colors.textMuted)
        .text(day.substring(0, 3).toUpperCase(), x, dayY, { width: dayWidth, align: 'center' });

      // Workout type
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor(isRest ? this.colors.textMuted : this.colors.accent)
        .text(
          isRest ? '—' : this.getWorkoutAbbr(workout!.type),
          x,
          dayY + 12,
          { width: dayWidth, align: 'center' },
        );

      // Hours (if applicable)
      if (!isRest && workout!.hours > 0) {
        doc
          .fontSize(7)
          .font('Helvetica')
          .fillColor(this.colors.textMuted)
          .text(`${workout!.hours}h`, x, dayY + 24, { width: dayWidth, align: 'center' });
      }
    });

    return startY + cardHeight;
  }

  /**
   * Footer: Branding and date
   */
  private drawFooter(doc: PDFKit.PDFDocument): void {
    const footerY = doc.page.height - this.pageMargin - 30;

    // Horizontal line
    doc
      .moveTo(this.pageMargin, footerY)
      .lineTo(this.pageMargin + this.contentWidth, footerY)
      .strokeColor(this.colors.borderSubtle)
      .lineWidth(1)
      .stroke();

    // Footer text
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(this.colors.textMuted)
      .text('© 2025 Macro Calculator', this.pageMargin, footerY + 10);

    doc
      .text(
        `Generated ${new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`,
        this.pageMargin,
        footerY + 10,
        { width: this.contentWidth, align: 'right' },
      );
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private drawRoundedRect(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    color: string,
  ): void {
    doc.roundedRect(x, y, width, height, radius).fill(color);
  }

  private getWorkoutAbbr(type: string): string {
    const abbrs: Record<string, string> = {
      rest: '—',
      walking: 'WLK',
      yoga: 'YGA',
      pilates: 'PIL',
      cycling: 'CYC',
      dance: 'DNC',
      swimming: 'SWM',
      strength: 'STR',
      cardio: 'CRD',
      running: 'RUN',
      climbing: 'CLM',
      sports: 'SPT',
      martial_arts: 'MRT',
      boxing: 'BOX',
      hiit: 'HIIT',
      crossfit: 'CFT',
      other: 'OTH',
    };
    return abbrs[type] || type.substring(0, 3).toUpperCase();
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private formatGoal(goal: Goal): string {
    switch (goal) {
      case Goal.WEIGHT_LOSS:
        return 'Weight Loss';
      case Goal.MUSCLE_GAIN:
        return 'Muscle Gain';
      case Goal.MAINTENANCE:
        return 'Maintenance';
      default:
        return goal;
    }
  }
}
