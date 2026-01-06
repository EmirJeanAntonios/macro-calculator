import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, Loader2, RefreshCw, History, ChevronRight } from 'lucide-react';
import type { MacroResult } from '../types';
import { macroService } from '../services/api';
import LanguageSwitcher from '../components/LanguageSwitcher';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ResultsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<MacroResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);

      try {
        const response = await macroService.getResult(id);
        if (response.success && response.data) {
          setResult(response.data);
        } else {
          setError(response.error || t('errors.loadFailed'));
        }
      } catch {
        setError(t('errors.unexpected'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [id, t]);

  const handleDownloadPdf = async () => {
    if (!id) return;
    setIsDownloading(true);
    try {
      await macroService.downloadPdf(id);
    } catch {
      setError(t('errors.pdfFailed'));
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-sm text-error mb-4">{error || t('errors.notFound')}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 h-9 px-4 bg-accent text-background text-sm font-medium rounded-md hover:bg-accent-muted transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t('app.newCalculation')}
          </Link>
        </div>
      </div>
    );
  }

  // Calculate percentages
  const proteinCals = result.protein * 4;
  const carbsCals = result.carbs * 4;
  const fatsCals = result.fats * 9;
  const totalCals = proteinCals + carbsCals + fatsCals;
  const pct = {
    protein: Math.round((proteinCals / totalCals) * 100),
    carbs: Math.round((carbsCals / totalCals) * 100),
    fats: Math.round((fatsCals / totalCals) * 100),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border-subtle">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-text-primary tracking-tight">
            Macro Calculator
          </Link>
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className="h-8 px-3 flex items-center gap-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('app.new')}</span>
            </Link>
            <Link
              to="/history"
              className="h-8 px-3 flex items-center gap-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors"
            >
              <History className="w-3.5 h-3.5" />
            </Link>
            <LanguageSwitcher />
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className={cn(
                "h-8 px-3 flex items-center gap-1.5 rounded-md text-sm font-medium",
                "bg-accent text-background hover:bg-accent-muted transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {t('app.pdf')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="flex-1 py-6 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* Primary: Daily Calories */}
          <div className="bg-surface border border-border-subtle rounded-lg p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                  {t('results.dailyTargets')}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-text-primary text-data-lg">
                    {result.dailyCalories}
                  </span>
                  <span className="text-sm text-text-muted">{t('common.kcalPerDay')}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-muted mb-1">{t('results.bmr')}</p>
                <p className="text-sm text-text-secondary tabular-nums">{result.bmr}</p>
                <p className="text-xs text-text-muted mt-2 mb-1">{t('results.tdee')}</p>
                <p className="text-sm text-text-secondary tabular-nums">{result.tdee}</p>
              </div>
            </div>

            {/* Macro Distribution Bar */}
            <div className="h-2 rounded-full overflow-hidden flex bg-surface-muted">
              <div
                className="h-full bg-protein transition-all duration-500"
                style={{ width: `${pct.protein}%` }}
              />
              <div
                className="h-full bg-carbs transition-all duration-500"
                style={{ width: `${pct.carbs}%` }}
              />
              <div
                className="h-full bg-fats transition-all duration-500"
                style={{ width: `${pct.fats}%` }}
              />
            </div>
          </div>

          {/* Macro Breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <MacroCard
              label={t('results.protein')}
              value={result.protein}
              percentage={pct.protein}
              color="protein"
            />
            <MacroCard
              label={t('results.carbs')}
              value={result.carbs}
              percentage={pct.carbs}
              color="carbs"
            />
            <MacroCard
              label={t('results.fats')}
              value={result.fats}
              percentage={pct.fats}
              color="fats"
            />
          </div>

          {/* Workout / Rest Day Adjustments */}
          {result.workoutDayCalories && result.restDayCalories && (
            <div className="grid grid-cols-2 gap-3">
              <DayCard
                type="workout"
                calories={result.workoutDayCalories}
                protein={result.workoutDayProtein!}
                carbs={result.workoutDayCarbs!}
                fats={result.workoutDayFats!}
              />
              <DayCard
                type="rest"
                calories={result.restDayCalories}
                protein={result.restDayProtein!}
                carbs={result.restDayCarbs!}
                fats={result.restDayFats!}
              />
            </div>
          )}

          {/* Quick Tips */}
          <div className="bg-surface border border-border-subtle rounded-lg p-4">
            <p className="text-xs text-text-muted uppercase tracking-wide mb-3">
              {t('results.proTips')}
            </p>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-text-muted mt-0.5 flex-shrink-0" />
                <span>{t('results.tips.protein')}</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 text-text-muted mt-0.5 flex-shrink-0" />
                <span>{t('results.tips.hydration')}</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link
              to="/"
              className="flex-1 h-10 flex items-center justify-center gap-2 rounded-md border border-border-default text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t('app.newCalculation')}
            </Link>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex-1 h-10 flex items-center justify-center gap-2 rounded-md bg-accent text-background text-sm font-medium hover:bg-accent-muted transition-colors disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {t('results.downloadPdf')}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-4 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-text-muted">
          <span>{t('app.copyright')}</span>
          <Link to="/history" className="hover:text-text-secondary transition-colors">
            {t('app.viewHistory')}
          </Link>
        </div>
      </footer>
    </div>
  );
}

/* Inline Components for Dashboard */

function MacroCard({
  label,
  value,
  percentage,
  color,
}: {
  label: string;
  value: number;
  percentage: number;
  color: 'protein' | 'carbs' | 'fats';
}) {
  const { t } = useTranslation();
  const colorClass = {
    protein: 'text-protein',
    carbs: 'text-carbs',
    fats: 'text-fats',
  }[color];

  const bgClass = {
    protein: 'bg-protein',
    carbs: 'bg-carbs',
    fats: 'bg-fats',
  }[color];

  return (
    <div className="bg-surface border border-border-subtle rounded-lg p-4">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <div className="flex items-baseline gap-1 mb-3">
        <span className={cn("text-2xl font-semibold text-data", colorClass)}>
          {value}
        </span>
        <span className="text-xs text-text-muted">{t('common.grams')}</span>
      </div>
      <div className="h-1 rounded-full bg-surface-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", bgClass)}
          style={{ width: `${percentage}%`, opacity: 0.8 }}
        />
      </div>
      <p className="text-xs text-text-muted mt-1.5">{percentage}%</p>
    </div>
  );
}

function DayCard({
  type,
  calories,
  protein,
  carbs,
  fats,
}: {
  type: 'workout' | 'rest';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}) {
  const { t } = useTranslation();
  const isWorkout = type === 'workout';

  return (
    <div className={cn(
      "bg-surface border rounded-lg p-4",
      isWorkout ? "border-accent/20" : "border-border-subtle"
    )}>
      <p className="text-xs text-text-muted mb-2">
        {isWorkout ? t('results.workoutDay') : t('results.restDay')}
      </p>
      <p className="text-xl font-semibold text-text-primary text-data mb-3">
        {calories}
        <span className="text-xs text-text-muted font-normal ml-1">{t('common.kcal')}</span>
      </p>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-text-muted">P</span>
          <span className="ml-1 text-text-secondary tabular-nums">{protein}g</span>
        </div>
        <div>
          <span className="text-text-muted">C</span>
          <span className="ml-1 text-text-secondary tabular-nums">{carbs}g</span>
        </div>
        <div>
          <span className="text-text-muted">F</span>
          <span className="ml-1 text-text-secondary tabular-nums">{fats}g</span>
        </div>
      </div>
    </div>
  );
}
