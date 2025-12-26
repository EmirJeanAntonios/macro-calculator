import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Dumbbell,
  Heart,
  Zap,
  Sparkles,
  Trophy,
  Moon,
  MoreHorizontal,
  Clock,
  Footprints,
  Bike,
  Waves,
  PersonStanding,
  Flame,
  Hand,
  Music,
  Mountain,
  Swords,
  Plus,
  X,
  Loader2,
} from 'lucide-react';
import type { Workout, DayOfWeek } from '../types';
import { useWorkoutTypes } from '../contexts/WorkoutTypesContext';

interface WorkoutCalendarProps {
  onSubmit: (workouts: Workout[]) => void;
  onBack: () => void;
}

// Icon mapping for dynamic workout types
const ICON_MAP: Record<string, React.ElementType> = {
  Dumbbell,
  Heart,
  Zap,
  Sparkles,
  Trophy,
  Moon,
  MoreHorizontal,
  Footprints,
  Bike,
  Waves,
  PersonStanding,
  Flame,
  Hand,
  Music,
  Mountain,
  Swords,
};

// Color mapping for dynamic workout types
const COLOR_MAP: Record<string, { text: string; bg: string }> = {
  slate: { text: 'text-slate-400', bg: 'bg-slate-500/20' },
  gray: { text: 'text-gray-400', bg: 'bg-gray-500/20' },
  red: { text: 'text-red-400', bg: 'bg-red-500/20' },
  orange: { text: 'text-orange-400', bg: 'bg-orange-500/20' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/20' },
  yellow: { text: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  lime: { text: 'text-lime-400', bg: 'bg-lime-500/20' },
  green: { text: 'text-green-400', bg: 'bg-green-500/20' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/20' },
  indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  violet: { text: 'text-violet-400', bg: 'bg-violet-500/20' },
  purple: { text: 'text-purple-400', bg: 'bg-purple-500/20' },
  fuchsia: { text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/20' },
  pink: { text: 'text-pink-400', bg: 'bg-pink-500/20' },
  rose: { text: 'text-rose-400', bg: 'bg-rose-500/20' },
  stone: { text: 'text-stone-400', bg: 'bg-stone-500/20' },
  teal: { text: 'text-teal-400', bg: 'bg-teal-500/20' },
};

const DAY_KEYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

interface DayWorkoutItem {
  id: string;
  type: string;
  hours: number;
}

type DaySchedule = DayWorkoutItem[];

export default function WorkoutCalendar({ onSubmit, onBack }: WorkoutCalendarProps) {
  const { t } = useTranslation();
  const { workoutTypes, isLoading: isLoadingTypes } = useWorkoutTypes();
  
  const [schedule, setSchedule] = useState<Record<DayOfWeek, DaySchedule>>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });

  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [addingWorkout, setAddingWorkout] = useState(false);
  
  // Get default workout type from loaded types
  const getDefaultWorkoutType = () => {
    const firstNonRest = workoutTypes.find(t => t.key !== 'rest');
    return firstNonRest?.key || 'strength';
  };
  
  const [newWorkoutType, setNewWorkoutType] = useState<string>('strength');
  const [newWorkoutHours, setNewWorkoutHours] = useState(1);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const getWorkoutLabel = (typeKey: string) => {
    const workoutType = workoutTypes.find(t => t.key === typeKey);
    if (workoutType) {
      return workoutType.name;
    }
    // Fallback to translation
    return t(`calendar.workouts.${typeKey}`, typeKey);
  };

  const getDayLabel = (day: DayOfWeek) => t(`calendar.days.${day}`);
  const getDayShort = (day: DayOfWeek) => {
    const shortMap: Record<DayOfWeek, string> = {
      monday: 'mon',
      tuesday: 'tue',
      wednesday: 'wed',
      thursday: 'thu',
      friday: 'fri',
      saturday: 'sat',
      sunday: 'sun',
    };
    return t(`calendar.days.${shortMap[day]}`);
  };

  const addWorkout = (day: DayOfWeek) => {
    const newWorkout: DayWorkoutItem = {
      id: generateId(),
      type: newWorkoutType,
      hours: newWorkoutHours,
    };
    setSchedule((prev) => ({
      ...prev,
      [day]: [...prev[day], newWorkout],
    }));
    setAddingWorkout(false);
    // Reset to first non-rest type
    setNewWorkoutType(getDefaultWorkoutType());
    setNewWorkoutHours(1);
  };

  const removeWorkout = (day: DayOfWeek, workoutId: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].filter((w) => w.id !== workoutId),
    }));
  };

  const handleSubmit = () => {
    const workouts: Workout[] = [];
    
    DAY_KEYS.forEach((key) => {
      const dayWorkouts = schedule[key];
      if (dayWorkouts.length === 0) {
        workouts.push({
          day: key,
          type: 'rest',
          hours: 0,
        });
      } else {
        dayWorkouts.forEach((w) => {
          workouts.push({
            day: key,
            type: w.type,
            hours: w.hours,
          });
        });
      }
    });
    
    onSubmit(workouts);
  };

  const getWorkoutInfo = (typeKey: string) => {
    const workoutType = workoutTypes.find(t => t.key === typeKey);
    const IconComponent = workoutType?.icon ? ICON_MAP[workoutType.icon] || Dumbbell : Dumbbell;
    const colors = workoutType?.color ? COLOR_MAP[workoutType.color] || COLOR_MAP.gray : COLOR_MAP.gray;
    
    return {
      icon: IconComponent,
      color: colors.text,
      bgColor: colors.bg,
      intensity: workoutType?.intensity || 1.0,
    };
  };

  const workoutDays = Object.values(schedule).filter((d) => d.length > 0).length;

  if (isLoadingTypes) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  // Filter out rest from selectable workout types (rest is implied when no workouts)
  const selectableWorkoutTypes = workoutTypes.filter(t => t.key !== 'rest');

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {t('calendar.title')}
        </h2>
        <p className="text-slate-400">
          {t('calendar.subtitle')}
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {/* Day Headers */}
        {DAY_KEYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs md:text-sm font-medium text-slate-400 pb-2"
          >
            <span className="hidden md:inline">{getDayLabel(day)}</span>
            <span className="md:hidden">{getDayShort(day)}</span>
          </div>
        ))}

        {/* Day Cards */}
        {DAY_KEYS.map((day) => {
          const dayWorkouts = schedule[day];
          const hasWorkouts = dayWorkouts.length > 0;
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              onClick={() => {
                setSelectedDay(isSelected ? null : day);
                setAddingWorkout(false);
              }}
              className={`
                relative aspect-square rounded-xl border-2 transition-all p-2
                flex flex-col items-center justify-center gap-1
                ${isSelected
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : hasWorkouts
                    ? 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                    : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                }
              `}
            >
              {hasWorkouts ? (
                <div className="flex flex-wrap gap-1 justify-center">
                  {dayWorkouts.slice(0, 3).map((w) => {
                    const info = getWorkoutInfo(w.type);
                    const Icon = info.icon;
                    return (
                      <div
                        key={w.id}
                        className={`w-6 h-6 md:w-8 md:h-8 rounded-lg ${info.bgColor} flex items-center justify-center`}
                      >
                        <Icon className={`w-3 h-3 md:w-4 md:h-4 ${info.color}`} />
                      </div>
                    );
                  })}
                  {dayWorkouts.length > 3 && (
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                      +{dayWorkouts.length - 3}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Moon className="w-5 h-5 md:w-6 md:h-6 text-slate-600" />
                  <span className="text-xs text-slate-600 mt-1">{t('calendar.rest')}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Day Detail Panel */}
      {selectedDay && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8 animate-slideUp">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              {getDayLabel(selectedDay)}
            </h3>
            <button
              onClick={() => setSelectedDay(null)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Workouts List */}
          {schedule[selectedDay].length > 0 ? (
            <div className="space-y-3 mb-4">
              {schedule[selectedDay].map((workout) => {
                const info = getWorkoutInfo(workout.type);
                const Icon = info.icon;
                return (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${info.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${info.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-white">{getWorkoutLabel(workout.type)}</p>
                        <p className="text-sm text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {workout.hours} {t('calendar.hours')}
                          <span className="ml-2 text-xs opacity-60">
                            ({info.intensity.toFixed(1)}x intensity)
                          </span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeWorkout(selectedDay, workout.id)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 mb-4">{t('calendar.noWorkouts')}</p>
          )}

          {/* Add Workout Form */}
          {addingWorkout ? (
            <div className="bg-slate-900/50 rounded-xl p-4 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">{t('calendar.workoutType')}</label>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {selectableWorkoutTypes.map((type) => {
                    const IconComponent = type.icon ? ICON_MAP[type.icon] || Dumbbell : Dumbbell;
                    const colors = type.color ? COLOR_MAP[type.color] || COLOR_MAP.gray : COLOR_MAP.gray;
                    const isSelected = newWorkoutType === type.key;
                    return (
                      <button
                        key={type.key}
                        onClick={() => setNewWorkoutType(type.key)}
                        title={`${type.name} (${type.intensity.toFixed(1)}x)`}
                        className={`
                          flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all
                          ${isSelected
                            ? `border-emerald-500 ${colors.bg}`
                            : 'border-transparent bg-slate-800 hover:bg-slate-700'
                          }
                        `}
                      >
                        <IconComponent className={`w-5 h-5 ${isSelected ? colors.text : 'text-slate-400'}`} />
                        <span className={`text-xs mt-1 truncate max-w-full ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                          {type.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">{t('calendar.duration')}</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0.5"
                    max="4"
                    step="0.5"
                    value={newWorkoutHours}
                    onChange={(e) => setNewWorkoutHours(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-500"
                  />
                  <span className="text-white font-medium w-16 text-center">
                    {newWorkoutHours}h
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setAddingWorkout(false)}
                  className="flex-1 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => addWorkout(selectedDay)}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
                >
                  {t('calendar.addWorkout')}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingWorkout(true)}
              className="w-full py-3 border-2 border-dashed border-slate-600 hover:border-emerald-500 rounded-xl text-slate-400 hover:text-emerald-400 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('calendar.addWorkout')}
            </button>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between text-slate-400 mb-8">
        <span>
          {t('calendar.workoutDays')}: <span className="text-white font-medium">{workoutDays}</span>
        </span>
        <span>
          {t('calendar.restDays')}: <span className="text-white font-medium">{7 - workoutDays}</span>
        </span>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.back')}
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/25"
        >
          {t('calendar.calculate')}
        </button>
      </div>
    </div>
  );
}
