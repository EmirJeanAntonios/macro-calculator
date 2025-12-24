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
  TreePine,
  Mountain,
  Swords,
  Plus,
  X,
} from 'lucide-react';
import type { Workout, DayOfWeek, WorkoutType } from '../types';

interface WorkoutCalendarProps {
  onSubmit: (workouts: Workout[]) => void;
  onBack: () => void;
}

const WORKOUT_TYPE_CONFIG: {
  type: WorkoutType;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}[] = [
  { type: 'rest', icon: Moon, color: 'text-slate-400', bgColor: 'bg-slate-500/20' },
  { type: 'strength', icon: Dumbbell, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  { type: 'cardio', icon: Heart, color: 'text-rose-400', bgColor: 'bg-rose-500/20' },
  { type: 'running', icon: Footprints, color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  { type: 'cycling', icon: Bike, color: 'text-lime-400', bgColor: 'bg-lime-500/20' },
  { type: 'swimming', icon: Waves, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  { type: 'hiit', icon: Zap, color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  { type: 'crossfit', icon: Flame, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  { type: 'yoga', icon: Sparkles, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  { type: 'pilates', icon: PersonStanding, color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  { type: 'boxing', icon: Hand, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  { type: 'martial_arts', icon: Swords, color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' },
  { type: 'dance', icon: Music, color: 'text-fuchsia-400', bgColor: 'bg-fuchsia-500/20' },
  { type: 'climbing', icon: Mountain, color: 'text-stone-400', bgColor: 'bg-stone-500/20' },
  { type: 'walking', icon: TreePine, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  { type: 'sports', icon: Trophy, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  { type: 'other', icon: MoreHorizontal, color: 'text-teal-400', bgColor: 'bg-teal-500/20' },
];

const DAY_KEYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

interface DayWorkoutItem {
  id: string;
  type: WorkoutType;
  hours: number;
}

type DaySchedule = DayWorkoutItem[];

export default function WorkoutCalendar({ onSubmit, onBack }: WorkoutCalendarProps) {
  const { t } = useTranslation();
  
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
  const [newWorkoutType, setNewWorkoutType] = useState<WorkoutType>('strength');
  const [newWorkoutHours, setNewWorkoutHours] = useState(1);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const getWorkoutLabel = (type: WorkoutType) => t(`calendar.workouts.${type}`);
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
    setNewWorkoutType('strength');
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

  const getWorkoutInfo = (type: WorkoutType) => {
    return WORKOUT_TYPE_CONFIG.find((w) => w.type === type) || WORKOUT_TYPE_CONFIG[0];
  };

  const workoutDays = Object.values(schedule).filter((d) => d.length > 0).length;
  const totalWorkouts = Object.values(schedule).reduce((sum, d) => sum + d.length, 0);
  const totalHours = Object.values(schedule).reduce(
    (sum, d) => sum + d.reduce((s, w) => s + w.hours, 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Weekly Overview */}
      <div className="grid grid-cols-7 gap-2">
        {DAY_KEYS.map((key) => {
          const dayWorkouts = schedule[key];
          const hasWorkouts = dayWorkouts.length > 0;
          const isSelected = selectedDay === key;
          const primaryWorkout = hasWorkouts ? getWorkoutInfo(dayWorkouts[0].type) : getWorkoutInfo('rest');
          const Icon = primaryWorkout.icon;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDay(isSelected ? null : key)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                isSelected
                  ? 'ring-2 ring-emerald-500 bg-slate-700/50'
                  : 'hover:bg-slate-700/30'
              } ${hasWorkouts ? primaryWorkout.bgColor : 'bg-slate-500/10'}`}
            >
              <span className="text-xs text-slate-400 mb-1">{getDayShort(key)}</span>
              <div className={`p-2 rounded-lg ${primaryWorkout.bgColor} relative`}>
                <Icon className={`w-5 h-5 ${primaryWorkout.color}`} />
                {dayWorkouts.length > 1 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {dayWorkouts.length}
                  </span>
                )}
              </div>
              {hasWorkouts && (
                <span className="text-xs text-slate-300 mt-1">
                  {dayWorkouts.reduce((s, w) => s + w.hours, 0)}h
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Editor */}
      {selectedDay && (
        <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold capitalize">
              {getDayLabel(selectedDay)}
            </h3>
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Workouts List */}
          {schedule[selectedDay].length > 0 && (
            <div className="space-y-2 mb-4">
              {schedule[selectedDay].map((workout) => {
                const info = getWorkoutInfo(workout.type);
                const Icon = info.icon;
                return (
                  <div
                    key={workout.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${info.bgColor}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${info.color}`} />
                      <span className={`font-medium ${info.color}`}>{getWorkoutLabel(workout.type)}</span>
                      <span className="text-slate-400 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {workout.hours}h
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeWorkout(selectedDay, workout.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Workout Form */}
          {addingWorkout ? (
            <div className="space-y-4 p-4 bg-slate-800/50 rounded-xl">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto pr-1">
                {WORKOUT_TYPE_CONFIG.filter((w) => w.type !== 'rest').map(({ type, icon: Icon, color, bgColor }) => {
                  const isActive = newWorkoutType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewWorkoutType(type)}
                      className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                        isActive
                          ? `${bgColor} ring-2 ring-offset-1 ring-offset-slate-800 ${color.replace('text-', 'ring-')}`
                          : 'bg-slate-700/50 hover:bg-slate-600/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${isActive ? color : 'text-slate-500'}`} />
                      <span className={`text-xs ${isActive ? color : 'text-slate-500'}`}>
                        {getWorkoutLabel(type)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Duration */}
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                  <Clock className="w-4 h-4" />
                  {t('calendar.duration')} ({t('calendar.hours')})
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="4"
                    step="0.5"
                    value={newWorkoutHours}
                    onChange={(e) => setNewWorkoutHours(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="w-16 text-center px-3 py-2 bg-slate-800 rounded-lg text-emerald-400 font-semibold">
                    {newWorkoutHours}h
                  </span>
                </div>
              </div>

              {/* Add/Cancel Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAddingWorkout(false)}
                  className="flex-1 py-2 text-sm text-slate-400 hover:text-white transition-colors border border-slate-600 rounded-lg"
                >
                  {t('calendar.back')}
                </button>
                <button
                  type="button"
                  onClick={() => addWorkout(selectedDay)}
                  className="flex-1 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                  {t('calendar.addWorkout')}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingWorkout(true)}
              className="w-full py-3 border-2 border-dashed border-slate-600 hover:border-emerald-500 text-slate-400 hover:text-emerald-400 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('calendar.addWorkout')}
            </button>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-700/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-emerald-400">{workoutDays}</div>
          <div className="text-sm text-slate-400">{t('calendar.days.monday').split(' ')[0]}s</div>
        </div>
        <div className="bg-slate-700/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-cyan-400">{totalWorkouts}</div>
          <div className="text-sm text-slate-400">Workouts</div>
        </div>
        <div className="bg-slate-700/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-amber-400">{totalHours}</div>
          <div className="text-sm text-slate-400">{t('calendar.hours')}</div>
        </div>
      </div>

      {/* Instructions */}
      <p className="text-center text-slate-500 text-sm">
        {t('calendar.description')}
      </p>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('calendar.back')}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/25"
        >
          {t('calendar.calculateMacros')}
        </button>
      </div>
    </div>
  );
}
