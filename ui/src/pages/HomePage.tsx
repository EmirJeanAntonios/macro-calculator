import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calculator, Loader2, History, Plus } from 'lucide-react';
import { UserInputForm, StepIndicator, WorkoutCalendar } from '../components';
import type { UserInput, Workout, CalculateRequest } from '../types';
import { macroService } from '../services/api';

const STEPS = [
  { id: 1, label: 'Your Info' },
  { id: 2, label: 'Workout Schedule' },
  { id: 3, label: 'Results' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUserInputSubmit = (data: UserInput) => {
    setUserInput(data);
    setCurrentStep(2);
  };

  const handleWorkoutSubmit = async (workouts: Workout[]) => {
    if (!userInput) return;

    setIsLoading(true);
    setError(null);

    try {
      const request: CalculateRequest = {
        userInput,
        workouts,
      };

      const response = await macroService.calculate(request);

      if (response.success && response.data) {
        navigate(`/results/${response.data.id}`);
      } else {
        setError(response.error || 'Failed to calculate macros');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
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
              Macro Calculator
            </h1>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400"
            >
              <Plus className="w-4 h-4" />
              New Calculation
            </Link>
            <Link
              to="/history"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <History className="w-4 h-4" />
              History
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-8">
        <div className="max-w-2xl mx-auto">
          {/* Step Indicator */}
          <StepIndicator steps={STEPS} currentStep={currentStep} />

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-slate-800 p-8 rounded-2xl flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
                <p className="text-white font-medium">Calculating your macros...</p>
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            {currentStep === 1 && (
              <>
                <h2 className="text-2xl font-bold mb-2 text-center">
                  Tell Us About Yourself
                </h2>
                <p className="text-slate-400 text-center mb-8">
                  Enter your details to get personalized macro recommendations
                </p>
                <UserInputForm
                  onSubmit={handleUserInputSubmit}
                  initialData={userInput || undefined}
                />
              </>
            )}

            {currentStep === 2 && (
              <>
                <h2 className="text-2xl font-bold mb-2 text-center">
                  Your Workout Schedule
                </h2>
                <p className="text-slate-400 text-center mb-8">
                  Set your weekly workout plan to optimize your nutrition
                </p>
                <WorkoutCalendar onSubmit={handleWorkoutSubmit} onBack={handleBack} />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-white/10 text-center text-slate-500 text-sm">
        <p>Macro Calculator — Calculate your perfect nutrition plan</p>
      </footer>
    </div>
  );
}
