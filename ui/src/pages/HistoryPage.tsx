import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { History, Loader2, Plus, ChevronRight, RefreshCw, Calendar } from 'lucide-react';
import type { MacroResult } from '../types';
import { macroService } from '../services/api';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function HistoryPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [results, setResults] = useState<MacroResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Only fetch user's own calculations (stored in localStorage)
      const response = await macroService.getUserHistory();
      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setError(response.error || t('errors.loadFailed'));
      }
    } catch {
      setError(t('errors.unexpected'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeMap: Record<string, string> = { en: 'en-US', es: 'es-ES', tr: 'tr-TR', fr: 'fr-FR' };
    return new Intl.DateTimeFormat(localeMap[i18n.language] || 'en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(date);
  };

  const getGoalLabel = (goal?: string) => goal ? t(`history.goals.${goal}`) : '';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border-subtle">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-text-primary tracking-tight">
            Macro Calculator
          </Link>
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className="h-8 px-3 flex items-center gap-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('app.new')}</span>
            </Link>
            <div className="h-8 px-3 flex items-center gap-1.5 rounded-md text-sm bg-surface-muted text-text-primary">
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('app.history')}</span>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 py-6 px-4">
        <div className="max-w-lg mx-auto">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-text-primary">{t('history.title')}</h1>
            <p className="text-sm text-text-secondary">{t('history.subtitle')}</p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="p-4 rounded-md bg-error/10 border border-error/20 text-center">
              <p className="text-sm text-error mb-3">{error}</p>
              <button
                onClick={loadResults}
                className="h-8 px-3 inline-flex items-center gap-1.5 text-sm text-error hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('history.tryAgain')}
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && results.length === 0 && (
            <div className="bg-surface border border-border-subtle rounded-lg p-8 text-center">
              <History className="w-10 h-10 text-text-muted mx-auto mb-4" />
              <h3 className="text-sm font-medium text-text-primary mb-1">{t('history.noResults')}</h3>
              <p className="text-xs text-text-secondary mb-4">{t('history.startFirst')}</p>
              <button
                onClick={() => navigate('/')}
                className="h-9 px-4 inline-flex items-center gap-2 bg-accent text-background text-sm font-medium rounded-md hover:bg-accent-muted transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('history.createCalculation')}
              </button>
            </div>
          )}

          {/* Results List */}
          {!isLoading && !error && results.length > 0 && (
            <div className="space-y-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => navigate(`/results/${result.id}`)}
                  className="w-full bg-surface border border-border-subtle rounded-lg p-4 text-left hover:border-border-default transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Date & Goal */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(result.calculatedAt)}
                        </span>
                        {result.userInput?.goal && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-muted text-text-secondary">
                            {getGoalLabel(result.userInput.goal)}
                          </span>
                        )}
                      </div>

                      {/* Calories */}
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xl font-semibold text-text-primary text-data">
                          {result.dailyCalories}
                        </span>
                        <span className="text-xs text-text-muted">{t('common.kcal')}</span>
                      </div>

                      {/* Macros */}
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-text-muted">
                          P <span className="text-protein tabular-nums">{result.protein}g</span>
                        </span>
                        <span className="text-text-muted">
                          C <span className="text-carbs tabular-nums">{result.carbs}g</span>
                        </span>
                        <span className="text-text-muted">
                          F <span className="text-fats tabular-nums">{result.fats}g</span>
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-xs text-text-muted">
          <span>{t('app.copyright')}</span>
          <Link to="/" className="hover:text-text-secondary transition-colors">
            {t('app.newCalculation')}
          </Link>
        </div>
      </footer>
    </div>
  );
}
