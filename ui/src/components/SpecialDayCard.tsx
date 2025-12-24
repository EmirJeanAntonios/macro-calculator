import { useTranslation } from 'react-i18next';
import { Dumbbell, Moon } from 'lucide-react';

interface SpecialDayCardProps {
  type: 'workout' | 'rest';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export default function SpecialDayCard({
  type,
  calories,
  protein,
  carbs,
  fats,
}: SpecialDayCardProps) {
  const { t } = useTranslation();
  const isWorkout = type === 'workout';

  return (
    <div
      className={`rounded-2xl p-5 border ${
        isWorkout
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-slate-500/10 border-slate-500/30'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`p-2 rounded-xl ${
            isWorkout ? 'bg-emerald-500/20' : 'bg-slate-500/20'
          }`}
        >
          {isWorkout ? (
            <Dumbbell className="w-5 h-5 text-emerald-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-400" />
          )}
        </div>
        <div>
          <h4 className="font-semibold text-white">
            {isWorkout ? t('results.workoutDay') : t('results.restDay')}
          </h4>
          <p className="text-xs text-slate-400">
            {isWorkout ? t('results.moreCalories') : t('results.fewerCalories')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="text-xs text-slate-400">{t('results.calories')}</div>
          <div className="text-xl font-bold text-emerald-400">{calories}</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="text-xs text-slate-400">{t('results.protein')}</div>
          <div className="text-xl font-bold text-indigo-400">{protein}g</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="text-xs text-slate-400">{t('results.carbs')}</div>
          <div className="text-xl font-bold text-amber-400">{carbs}g</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="text-xs text-slate-400">{t('results.fats')}</div>
          <div className="text-xl font-bold text-rose-400">{fats}g</div>
        </div>
      </div>
    </div>
  );
}
