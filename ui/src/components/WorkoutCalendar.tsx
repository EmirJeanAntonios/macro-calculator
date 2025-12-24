import { useState } from 'react';
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
} from 'lucide-react';
import type { Workout, DayOfWeek, WorkoutType } from '../types';

interface WorkoutCalendarProps {
  onSubmit: (workouts: Workout[]) => void;
  onBack: () => void;
}

const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

const WORKOUT_TYPES: {
  type: WorkoutType;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}[] = [
  {
    type: 'rest',
    label: 'Rest',
    icon: Moon,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
  },
  {
    type: 'strength',
    label: 'Strength',
    icon: Dumbbell,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  {
    type: 'cardio',
    label: 'Cardio',
    icon: Heart,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/20',
  },
  {
    type: 'running',
    label: 'Running',
    icon: Footprints,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
  },
  {
    type: 'cycling',
    label: 'Cycling',
    icon: Bike,
    color: 'text-lime-400',
    bgColor: 'bg-lime-500/20',
  },
  {
    type: 'swimming',
    label: 'Swimming',
    icon: Waves,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
  },
  {
    type: 'hiit',
    label: 'HIIT',
    icon: Zap,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
  {
    type: 'crossfit',
    label: 'CrossFit',
    icon: Flame,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
  {
    type: 'yoga',
    label: 'Yoga',
    icon: Sparkles,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  {
    type: 'pilates',
    label: 'Pilates',
    icon: PersonStanding,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
  },
  {
    type: 'boxing',
    label: 'Boxing',
    icon: Hand,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  {
    type: 'martial_arts',
    label: 'Martial Arts',
    icon: Swords,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
  },
  {
    type: 'dance',
    label: 'Dance',
    icon: Music,
    color: 'text-fuchsia-400',
    bgColor: 'bg-fuchsia-500/20',
  },
  {
    type: 'climbing',
    label: 'Climbing',
    icon: Mountain,
    color: 'text-stone-400',
    bgColor: 'bg-stone-500/20',
  },
  {
    type: 'walking',
    label: 'Walking',
    icon: TreePine,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  {
    type: 'sports',
    label: 'Sports',
    icon: Trophy,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
  },
  {
    type: 'other',
    label: 'Other',
    icon: MoreHorizontal,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/20',
  },
];

interface DayWorkout {
  type: WorkoutType;
  hours: number;
  notes?: string;
}

export default function WorkoutCalendar({ onSubmit, onBack }: WorkoutCalendarProps) {
  const [schedule, setSchedule] = useState<Record<DayOfWeek, DayWorkout>>({
    monday: { type: 'rest', hours: 0 },
    tuesday: { type: 'rest', hours: 0 },
    wednesday: { type: 'rest', hours: 0 },
    thursday: { type: 'rest', hours: 0 },
    friday: { type: 'rest', hours: 0 },
    saturday: { type: 'rest', hours: 0 },
    sunday: { type: 'rest', hours: 0 },
  });

  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);

  const updateDay = (day: DayOfWeek, updates: Partial<DayWorkout>) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...updates },
    }));
  };

  const handleSubmit = () => {
    const workouts: Workout[] = DAYS.map(({ key }) => ({
      day: key,
      type: schedule[key].type,
      hours: schedule[key].type === 'rest' ? 0 : schedule[key].hours,
      notes: schedule[key].notes,
    }));
    onSubmit(workouts);
  };

  const getWorkoutInfo = (type: WorkoutType) => {
    return WORKOUT_TYPES.find((w) => w.type === type) || WORKOUT_TYPES[0];
  };

  const workoutDays = Object.values(schedule).filter((d) => d.type !== 'rest').length;
  const totalHours = Object.values(schedule).reduce((sum, d) => sum + (d.type !== 'rest' ? d.hours : 0), 0);

  return (
    <div className="space-y-6">
      {/* Weekly Overview */}
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map(({ key, short }) => {
          const dayData = schedule[key];
          const workoutInfo = getWorkoutInfo(dayData.type);
          const Icon = workoutInfo.icon;
          const isSelected = selectedDay === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDay(isSelected ? null : key)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                isSelected
                  ? 'ring-2 ring-emerald-500 bg-slate-700/50'
                  : 'hover:bg-slate-700/30'
              } ${workoutInfo.bgColor}`}
            >
              <span className="text-xs text-slate-400 mb-1">{short}</span>
              <div className={`p-2 rounded-lg ${workoutInfo.bgColor}`}>
                <Icon className={`w-5 h-5 ${workoutInfo.color}`} />
              </div>
              {dayData.type !== 'rest' && dayData.hours > 0 && (
                <span className="text-xs text-slate-300 mt-1">{dayData.hours}h</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Editor */}
      {selectedDay && (
        <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/50 animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="text-lg font-semibold mb-4 capitalize">
            {DAYS.find((d) => d.key === selectedDay)?.label}
          </h3>

          {/* Workout Type Selector */}
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-2">Workout Type</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
              {WORKOUT_TYPES.map(({ type, label, icon: Icon, color, bgColor }) => {
                const isActive = schedule[selectedDay].type === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateDay(selectedDay, { type, hours: type === 'rest' ? 0 : schedule[selectedDay].hours || 1 })}
                    className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                      isActive
                        ? `${bgColor} ring-2 ring-offset-1 ring-offset-slate-800 ${color.replace('text-', 'ring-')}`
                        : 'bg-slate-800/50 hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1 ${isActive ? color : 'text-slate-500'}`} />
                    <span className={`text-xs ${isActive ? color : 'text-slate-500'}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration Input (only for non-rest days) */}
          {schedule[selectedDay].type !== 'rest' && (
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <Clock className="w-4 h-4" />
                Duration (hours)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.5"
                  value={schedule[selectedDay].hours}
                  onChange={(e) => updateDay(selectedDay, { hours: parseFloat(e.target.value) })}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="w-16 text-center px-3 py-2 bg-slate-800 rounded-lg text-emerald-400 font-semibold">
                  {schedule[selectedDay].hours}h
                </span>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="flex-1 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-emerald-400">{workoutDays}</div>
          <div className="text-sm text-slate-400">Workout Days</div>
        </div>
        <div className="bg-slate-700/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-cyan-400">{totalHours}</div>
          <div className="text-sm text-slate-400">Total Hours</div>
        </div>
      </div>

      {/* Workout Type Legend */}
      <div className="flex flex-wrap gap-2 justify-center">
        {WORKOUT_TYPES.filter(w => w.type !== 'rest').slice(0, 8).map(({ type, label, icon: Icon, color }) => (
          <div key={type} className="flex items-center gap-1 text-xs text-slate-400">
            <Icon className={`w-3 h-3 ${color}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/25"
        >
          Calculate My Macros
        </button>
      </div>
    </div>
  );
}
