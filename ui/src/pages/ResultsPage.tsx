import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Loader2,
  Calculator,
  Flame,
  Activity,
  RefreshCw,
} from 'lucide-react';
import type { MacroResult } from '../types';
import { macroService } from '../services/api';
import MacroCard from '../components/MacroCard';
import CalorieRing from '../components/CalorieRing';
import SpecialDayCard from '../components/SpecialDayCard';

export default function ResultsPage() {
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
          setError(response.error || 'Failed to load results');
        }
      } catch {
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!id) return;

    setIsDownloading(true);
    try {
      await macroService.downloadPdf(id);
    } catch {
      setError('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  // Calculate macro percentages
  const calculatePercentages = (protein: number, carbs: number, fats: number) => {
    const proteinCals = protein * 4;
    const carbsCals = carbs * 4;
    const fatsCals = fats * 9;
    const total = proteinCals + carbsCals + fatsCals;

    return {
      protein: Math.round((proteinCals / total) * 100),
      carbs: Math.round((carbsCals / total) * 100),
      fats: Math.round((fatsCals / total) * 100),
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
          <p className="text-slate-400">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error || 'Results not found'}</div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Start New Calculation
          </Link>
        </div>
      </div>
    );
  }

  const percentages = calculatePercentages(result.protein, result.carbs, result.fats);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-6 px-8 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">New Calculation</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <Calculator className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Macro Calculator
            </h1>
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition-colors"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Download PDF</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Your Personalized
              <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Macro Plan
              </span>
            </h2>
            <p className="text-slate-400">
              Based on your profile and workout schedule
            </p>
          </div>

          {/* BMR & TDEE Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 flex items-center gap-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Flame className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <div className="text-sm text-slate-400">Basal Metabolic Rate</div>
                <div className="text-2xl font-bold text-white">
                  {result.bmr} <span className="text-sm text-slate-500">kcal</span>
                </div>
                <div className="text-xs text-slate-500">Calories burned at rest</div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 flex items-center gap-4">
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <Activity className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <div className="text-sm text-slate-400">Total Daily Energy</div>
                <div className="text-2xl font-bold text-white">
                  {result.tdee} <span className="text-sm text-slate-500">kcal</span>
                </div>
                <div className="text-xs text-slate-500">Including activity</div>
              </div>
            </div>
          </div>

          {/* Main Macros Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            <h3 className="text-xl font-semibold mb-6 text-center">Daily Macro Targets</h3>

            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Calorie Ring */}
              <div className="flex-shrink-0">
                <CalorieRing
                  calories={result.dailyCalories}
                  protein={result.protein}
                  carbs={result.carbs}
                  fats={result.fats}
                />
              </div>

              {/* Macro Cards */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <MacroCard
                  label="Protein"
                  value={result.protein}
                  unit="g"
                  color="indigo"
                  percentage={percentages.protein}
                />
                <MacroCard
                  label="Carbs"
                  value={result.carbs}
                  unit="g"
                  color="amber"
                  percentage={percentages.carbs}
                />
                <MacroCard
                  label="Fats"
                  value={result.fats}
                  unit="g"
                  color="rose"
                  percentage={percentages.fats}
                />
              </div>
            </div>

            {/* Macro Legend */}
            <div className="flex justify-center gap-6 mt-6 pt-6 border-t border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-sm text-slate-400">Protein (4 cal/g)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm text-slate-400">Carbs (4 cal/g)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-sm text-slate-400">Fats (9 cal/g)</span>
              </div>
            </div>
          </div>

          {/* Special Days Section */}
          {result.workoutDayCalories && result.restDayCalories && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center">
                Special Day Adjustments
              </h3>
              <p className="text-center text-slate-400 text-sm mb-6">
                Optimize your nutrition based on your activity level each day
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SpecialDayCard
                  type="workout"
                  calories={result.workoutDayCalories}
                  protein={result.workoutDayProtein!}
                  carbs={result.workoutDayCarbs!}
                  fats={result.workoutDayFats!}
                />
                <SpecialDayCard
                  type="rest"
                  calories={result.restDayCalories}
                  protein={result.restDayProtein!}
                  carbs={result.restDayCarbs!}
                  fats={result.restDayFats!}
                />
              </div>
            </div>
          )}

          {/* Tips Section */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-2xl border border-emerald-500/20 p-6">
            <h3 className="text-lg font-semibold mb-4 text-emerald-400">
              💡 Pro Tips
            </h3>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li>• Spread your protein intake across 4-5 meals for optimal absorption</li>
              <li>• Focus on complex carbs like oats, rice, and sweet potatoes</li>
              <li>• Include healthy fats from avocados, nuts, and olive oil</li>
              <li>• Stay hydrated - aim for at least 2-3 liters of water daily</li>
              <li>• Track your progress and adjust after 2-3 weeks if needed</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              New Calculation
            </Link>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
            >
              {isDownloading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              Download PDF Report
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-white/10 text-center text-slate-500 text-sm">
        <p>Macro Calculator — Your personalized nutrition guide</p>
      </footer>
    </div>
  );
}
