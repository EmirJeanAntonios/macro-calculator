import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  History, 
  Calculator, 
  Flame, 
  Calendar, 
  ChevronRight, 
  Loader2,
  Plus
} from 'lucide-react';
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
      const response = await macroService.getAllResults();
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
    const localeMap: Record<string, string> = {
      en: 'en-US',
      es: 'es-ES',
      tr: 'tr-TR',
      fr: 'fr-FR',
    };
    return new Intl.DateTimeFormat(localeMap[i18n.language] || 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getGoalLabel = (goal?: string) => {
    if (!goal) return '';
    return t(`history.goals.${goal}`);
  };

  const getGoalColor = (goal?: string) => {
    switch (goal) {
      case 'weight_loss': return 'text-rose-400 bg-rose-500/20';
      case 'muscle_gain': return 'text-emerald-400 bg-emerald-500/20';
      case 'maintenance': return 'text-cyan-400 bg-cyan-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-6 px-8 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <Calculator className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {t('app.title')}
            </h1>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('app.newCalculation')}</span>
            </Link>
            <Link
              to="/history"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">{t('app.history')}</span>
            </Link>
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <History className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t('history.title')}</h2>
              <p className="text-slate-400">{t('history.subtitle')}</p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
              <p className="text-slate-400">{t('history.loading')}</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-6 bg-red-500/20 border border-red-500/50 rounded-2xl text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={loadResults}
                className="px-4 py-2 bg-red-500/30 hover:bg-red-500/40 rounded-lg text-red-300 transition-colors"
              >
                {t('history.tryAgain')}
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && results.length === 0 && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center">
              <div className="p-4 bg-slate-700/50 rounded-full inline-block mb-4">
                <Calculator className="w-12 h-12 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('history.noResults')}</h3>
              <p className="text-slate-400 mb-6">{t('history.startFirst')}</p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5" />
                {t('history.createCalculation')}
              </button>
            </div>
          )}

          {/* Results List */}
          {!isLoading && !error && results.length > 0 && (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => navigate(`/results/${result.id}`)}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-emerald-500/50 hover:bg-slate-800/70 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {/* Date & Goal */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(result.calculatedAt)}
                        </div>
                        {result.userInput && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGoalColor(result.userInput.goal)}`}>
                            {getGoalLabel(result.userInput.goal)}
                          </span>
                        )}
                      </div>

                      {/* Macros Summary */}
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Flame className="w-5 h-5 text-orange-400" />
                          <span className="text-xl font-bold">{result.dailyCalories}</span>
                          <span className="text-slate-500 text-sm">{t('results.kcal')}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                            <span className="text-slate-400">P: <span className="text-white font-medium">{result.protein}g</span></span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            <span className="text-slate-400">C: <span className="text-white font-medium">{result.carbs}g</span></span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                            <span className="text-slate-400">F: <span className="text-white font-medium">{result.fats}g</span></span>
                          </div>
                        </div>
                      </div>

                      {/* User Info */}
                      {result.userInput && (
                        <div className="mt-3 text-sm text-slate-500">
                          {result.userInput.age} • {result.userInput.weight}{result.userInput.weightUnit} • {result.userInput.height}{result.userInput.heightUnit}
                        </div>
                      )}
                    </div>

                    <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-white/10 text-center text-slate-500 text-sm">
        <p>{t('app.title')} — {t('app.subtitle')}</p>
      </footer>
    </div>
  );
}
