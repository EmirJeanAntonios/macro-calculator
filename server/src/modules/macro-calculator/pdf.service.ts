import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { MacroResult, UserInput, Workout, Goal, WorkoutType } from '../../entities';

@Injectable()
export class PdfService {
  /**
   * Generate a PDF document with macro results
   */
  generateMacroPdf(
    macroResult: MacroResult,
    userInput: UserInput,
    workouts: Workout[],
  ): PDFKit.PDFDocument {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: 'Macro Calculator Results',
        Author: 'Macro Calculator App',
      },
    });

    // Colors
    const primaryColor = '#10b981';
    const textColor = '#1e293b';
    const mutedColor = '#64748b';

    // Header
    doc
      .fontSize(28)
      .fillColor(primaryColor)
      .text('Macro Calculator', { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .fillColor(mutedColor)
      .text('Your Personalized Nutrition Plan', { align: 'center' })
      .moveDown(2);

    // User Profile Section
    doc
      .fontSize(16)
      .fillColor(textColor)
      .text('Your Profile', { underline: true })
      .moveDown(0.5);

    doc.fontSize(11).fillColor(textColor);
    this.addProfileRow(doc, 'Age', `${userInput.age} years`);
    this.addProfileRow(doc, 'Gender', this.capitalize(userInput.gender));
    this.addProfileRow(
      doc,
      'Weight',
      `${userInput.weight} ${userInput.weightUnit}`,
    );
    this.addProfileRow(
      doc,
      'Height',
      `${userInput.height} ${userInput.heightUnit}`,
    );
    this.addProfileRow(doc, 'Goal', this.formatGoal(userInput.goal));
    doc.moveDown(1.5);

    // Base Calculations Section
    doc
      .fontSize(16)
      .fillColor(textColor)
      .text('Base Calculations', { underline: true })
      .moveDown(0.5);

    doc.fontSize(11);
    this.addProfileRow(doc, 'BMR (Basal Metabolic Rate)', `${macroResult.bmr} kcal`);
    this.addProfileRow(doc, 'TDEE (Total Daily Energy)', `${macroResult.tdee} kcal`);
    doc.moveDown(1.5);

    // Daily Macros Section
    doc
      .fontSize(16)
      .fillColor(textColor)
      .text('Daily Macro Targets', { underline: true })
      .moveDown(0.5);

    this.addMacroBox(doc, 'Average Day', {
      calories: macroResult.dailyCalories,
      protein: macroResult.protein,
      carbs: macroResult.carbs,
      fats: macroResult.fats,
    });
    doc.moveDown(1);

    // Special Days Section
    if (macroResult.workoutDayCalories && macroResult.restDayCalories) {
      doc
        .fontSize(14)
        .fillColor(primaryColor)
        .text('Special Day Variations', { underline: true })
        .moveDown(0.5);

      this.addMacroBox(doc, '🏋️ Workout Days', {
        calories: macroResult.workoutDayCalories,
        protein: macroResult.workoutDayProtein!,
        carbs: macroResult.workoutDayCarbs!,
        fats: macroResult.workoutDayFats!,
      });
      doc.moveDown(0.5);

      this.addMacroBox(doc, '😴 Rest Days', {
        calories: macroResult.restDayCalories,
        protein: macroResult.restDayProtein!,
        carbs: macroResult.restDayCarbs!,
        fats: macroResult.restDayFats!,
      });
      doc.moveDown(1);
    }

    // Workout Schedule Section
    doc
      .fontSize(16)
      .fillColor(textColor)
      .text('Weekly Workout Schedule', { underline: true })
      .moveDown(0.5);

    const daysOrder = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];

    doc.fontSize(10);
    for (const dayName of daysOrder) {
      const workout = workouts.find((w) => w.day === dayName);
      if (workout) {
        const typeLabel = this.formatWorkoutType(workout.type);
        const hours = workout.hours > 0 ? ` (${workout.hours}h)` : '';
        doc
          .fillColor(textColor)
          .text(`${this.capitalize(dayName)}: `, { continued: true })
          .fillColor(workout.type === WorkoutType.REST ? mutedColor : primaryColor)
          .text(`${typeLabel}${hours}`);
      }
    }
    doc.moveDown(2);

    // Footer
    doc
      .fontSize(9)
      .fillColor(mutedColor)
      .text(
        `Generated on ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`,
        { align: 'center' },
      )
      .text('Macro Calculator - Your Personalized Nutrition Guide', {
        align: 'center',
      });

    return doc;
  }

  private addProfileRow(
    doc: PDFKit.PDFDocument,
    label: string,
    value: string,
  ): void {
    doc
      .fillColor('#64748b')
      .text(`${label}: `, { continued: true })
      .fillColor('#1e293b')
      .text(value);
  }

  private addMacroBox(
    doc: PDFKit.PDFDocument,
    title: string,
    macros: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    },
  ): void {
    doc.fontSize(12).fillColor('#1e293b').text(title).moveDown(0.3);

    doc.fontSize(10);
    doc
      .fillColor('#10b981')
      .text(`Calories: ${macros.calories} kcal`, { indent: 20 });
    doc
      .fillColor('#6366f1')
      .text(`Protein: ${macros.protein}g`, { indent: 20 });
    doc.fillColor('#f59e0b').text(`Carbs: ${macros.carbs}g`, { indent: 20 });
    doc.fillColor('#ef4444').text(`Fats: ${macros.fats}g`, { indent: 20 });
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

  private formatWorkoutType(type: WorkoutType): string {
    switch (type) {
      case WorkoutType.REST:
        return 'Rest Day';
      case WorkoutType.CARDIO:
        return 'Cardio';
      case WorkoutType.STRENGTH:
        return 'Strength Training';
      case WorkoutType.HIIT:
        return 'HIIT';
      case WorkoutType.YOGA:
        return 'Yoga';
      case WorkoutType.SPORTS:
        return 'Sports';
      case WorkoutType.RUNNING:
        return 'Running';
      case WorkoutType.CYCLING:
        return 'Cycling';
      case WorkoutType.SWIMMING:
        return 'Swimming';
      case WorkoutType.PILATES:
        return 'Pilates';
      case WorkoutType.CROSSFIT:
        return 'CrossFit';
      case WorkoutType.BOXING:
        return 'Boxing';
      case WorkoutType.DANCE:
        return 'Dance';
      case WorkoutType.WALKING:
        return 'Walking';
      case WorkoutType.CLIMBING:
        return 'Climbing';
      case WorkoutType.MARTIAL_ARTS:
        return 'Martial Arts';
      case WorkoutType.OTHER:
        return 'Other';
      default:
        return type;
    }
  }
}

