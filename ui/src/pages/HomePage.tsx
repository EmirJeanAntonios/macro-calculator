import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, History, ChevronRight } from 'lucide-react';
import { UserInputForm, StepIndicator, WorkoutCalendar } from '../components';
import LanguageSwitcher from '../components/LanguageSwitcher';
import type { UserInput, Workout, CalculateRequest } from '../types';
import { macroService } from '../services/api';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const STEPS = [
    { id: 1, label: t('steps.yourInfo') },
    { id: 2, label: t('steps.workoutSchedule') },
    { id: 3, label: t('steps.results') },
  ];

  const handleUserInputSubmit = (data: UserInput) => {
    setUserInput(data);
    setCurrentStep(2);
  };

  const handleWorkoutSubmit = async (workouts: Workout[]) => {
    if (!userInput) return;

    setIsLoading(true);
    setError(null);

    try {
      const request: CalculateRequest = { userInput, workouts };
      const response = await macroService.calculate(request);

      if (response.success && response.data) {
        navigate(`/results/${response.data.id}`);
      } else {
        setError(response.error || t('errors.calculationFailed'));
      }
    } catch {
      setError(t('errors.unexpected'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Minimal */}
      <header className="border-b border-border-subtle">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-text-primary tracking-tight">
            MacroApp
          </Link>
          <div className="flex items-center gap-1">
            <Link
              to="/history"
              className={cn(
                "h-8 px-3 flex items-center gap-1.5 rounded-md text-sm",
                "text-text-secondary hover:text-text-primary hover:bg-surface-muted",
                "transition-colors"
              )}
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('app.history')}</span>
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Step Indicator */}
          <StepIndicator steps={STEPS} currentStep={currentStep} />

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-error/10 border border-error/20 text-error text-sm">
              {error}
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 text-accent animate-spin" />
                <p className="text-sm text-text-secondary">{t('home.calculating')}</p>
              </div>
            </div>
          )}

          {/* Content Card */}
          <div className="bg-surface border border-border-subtle rounded-lg p-6">
            {currentStep === 1 && (
              <div className="animate-fadeIn">
                <div className="mb-6">
                  <h1 className="text-lg font-semibold text-text-primary mb-1">
                    {t('home.tellUs')}
                  </h1>
                  <p className="text-sm text-text-secondary">
                    {t('home.enterDetails')}
                  </p>
                </div>
                <UserInputForm
                  onSubmit={handleUserInputSubmit}
                  initialData={userInput || undefined}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-fadeIn">
                <div className="mb-6">
                  <h1 className="text-lg font-semibold text-text-primary mb-1">
                    {t('home.workoutSchedule')}
                  </h1>
                  <p className="text-sm text-text-secondary">
                    {t('home.setWorkoutPlan')}
                  </p>
                </div>
                <WorkoutCalendar
                  onSubmit={handleWorkoutSubmit}
                  onBack={() => setCurrentStep(1)}
                />
              </div>
            )}
          </div>

          {/* Footer hint */}
          <p className="mt-4 text-center text-xs text-text-muted flex items-center justify-center gap-1">
            <ChevronRight className="w-3 h-3" />
            Takes about 2 minutes
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-4 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-xs text-text-muted">
          <span>© 2025 MacroApp</span>
          <Link to="/history" className="hover:text-text-secondary transition-colors">
            View history
          </Link>
        </div>
      </footer>
    </div>
  );
}
