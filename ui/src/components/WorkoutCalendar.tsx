import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Loader2,
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
} from 'lucide-react';
import type { Workout, DayOfWeek } from '../types';
import { useWorkoutTypes } from '../contexts/WorkoutTypesContext';

interface WorkoutCalendarProps {
  onSubmit: (workouts: Workout[]) => void;
  onBack: () => void;
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

const ICON_MAP: Record<string, React.ElementType> = {
  Dumbbell, Heart, Zap, Sparkles, Trophy, Moon, MoreHorizontal,
  Footprints, Bike, Waves, PersonStanding, Flame, Hand, Music, Mountain, Swords,
};

const DAY_KEYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

interface DayWorkoutItem {
  id: string;
  type: string;
  hours: number;
}

export default function WorkoutCalendar({ onSubmit, onBack }: WorkoutCalendarProps) {
  const { t } = useTranslation();
  const { workoutTypes, isLoading } = useWorkoutTypes();

  const [schedule, setSchedule] = useState<Record<DayOfWeek, DayWorkoutItem[]>>({
    monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [],
  });

  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [addingWorkout, setAddingWorkout] = useState(false);
  const [newWorkoutType, setNewWorkoutType] = useState('strength');
  const [newWorkoutHours, setNewWorkoutHours] = useState(1);

  const getDayLabel = (day: DayOfWeek) => t(`calendar.days.${day}`);
  const getDayShort = (day: DayOfWeek) => {
    const map: Record<DayOfWeek, string> = {
      monday: 'M', tuesday: 'T', wednesday: 'W', thursday: 'T', friday: 'F', saturday: 'S', sunday: 'S',
    };
    return map[day];
  };

  const getWorkoutLabel = (key: string) => {
    const type = workoutTypes.find(t => t.key === key);
    return type?.name || key;
  };

  const addWorkout = (day: DayOfWeek) => {
    const newWorkout: DayWorkoutItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: newWorkoutType,
      hours: newWorkoutHours,
    };
    setSchedule((prev) => ({ ...prev, [day]: [...prev[day], newWorkout] }));
    setAddingWorkout(false);
  };

  const removeWorkout = (day: DayOfWeek, id: string) => {
    setSchedule((prev) => ({ ...prev, [day]: prev[day].filter((w) => w.id !== id) }));
  };

  const handleSubmit = () => {
    const workouts: Workout[] = [];
    DAY_KEYS.forEach((day) => {
      const dayWorkouts = schedule[day];
      if (dayWorkouts.length === 0) {
        workouts.push({ day, type: 'rest', hours: 0 });
      } else {
        dayWorkouts.forEach((w) => workouts.push({ day, type: w.type, hours: w.hours }));
      }
    });
    onSubmit(workouts);
  };

  const workoutDays = Object.values(schedule).filter((d) => d.length > 0).length;
  const selectableTypes = workoutTypes.filter(t => t.key !== 'rest');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Headers */}
        {DAY_KEYS.map((day) => (
          <div key={day} className="text-center text-[10px] text-text-muted pb-1">
            {getDayShort(day)}
          </div>
        ))}

        {/* Day Cells */}
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
              className={cn(
                "aspect-square rounded-md flex flex-col items-center justify-center gap-0.5 transition-colors text-xs",
                isSelected && "bg-accent/20 ring-1 ring-accent",
                !isSelected && hasWorkouts && "bg-surface-elevated border border-border-subtle",
                !isSelected && !hasWorkouts && "bg-surface-muted border border-border-subtle hover:border-border-default"
              )}
            >
              {hasWorkouts ? (
                <span className="text-text-primary font-medium">{dayWorkouts.length}</span>
              ) : (
                <Moon className="w-3.5 h-3.5 text-text-muted" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Panel */}
      {selectedDay && (
        <div className="bg-surface-muted rounded-md p-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-text-primary">{getDayLabel(selectedDay)}</span>
            <button onClick={() => setSelectedDay(null)} className="text-text-muted hover:text-text-primary">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Workouts List */}
          {schedule[selectedDay].length > 0 && (
            <div className="space-y-2 mb-3">
              {schedule[selectedDay].map((w) => {
                const type = workoutTypes.find(t => t.key === w.type);
                const Icon = type?.icon ? ICON_MAP[type.icon] : Dumbbell;
                return (
                  <div key={w.id} className="flex items-center justify-between p-2 bg-surface rounded-md">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-text-muted" />
                      <span className="text-sm text-text-primary">{getWorkoutLabel(w.type)}</span>
                      <span className="text-xs text-text-muted">{w.hours}h</span>
                    </div>
                    <button
                      onClick={() => removeWorkout(selectedDay, w.id)}
                      className="text-text-muted hover:text-error"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Workout Form */}
          {addingWorkout ? (
            <div className="space-y-3 p-3 bg-surface rounded-md">
              <div>
                <p className="text-xs text-text-muted mb-2">{t('calendar.workoutType')}</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {selectableTypes.slice(0, 10).map((type) => {
                    const Icon = type.icon ? ICON_MAP[type.icon] : Dumbbell;
                    return (
                      <button
                        key={type.key}
                        onClick={() => setNewWorkoutType(type.key)}
                        className={cn(
                          "aspect-square rounded-md flex items-center justify-center transition-colors",
                          newWorkoutType === type.key
                            ? "bg-accent text-background"
                            : "bg-surface-muted text-text-muted hover:text-text-primary"
                        )}
                        title={type.name}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-2">{t('calendar.duration')}</p>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="4"
                    step="0.5"
                    value={newWorkoutHours}
                    onChange={(e) => setNewWorkoutHours(parseFloat(e.target.value))}
                    className="flex-1 accent-accent"
                  />
                  <span className="text-sm text-text-primary tabular-nums w-8">{newWorkoutHours}h</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setAddingWorkout(false)}
                  className="flex-1 h-8 text-xs text-text-muted hover:text-text-primary"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => addWorkout(selectedDay)}
                  className="flex-1 h-8 bg-accent text-background text-xs font-medium rounded-md hover:bg-accent-muted"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingWorkout(true)}
              className="w-full h-9 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border-default text-sm text-text-muted hover:text-text-primary hover:border-accent transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('calendar.addWorkout')}
            </button>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between text-xs text-text-muted px-1">
        <span>{t('calendar.workoutDays')}: <span className="text-text-primary tabular-nums">{workoutDays}</span></span>
        <span>{t('calendar.restDays')}: <span className="text-text-primary tabular-nums">{7 - workoutDays}</span></span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="h-10 px-4 flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('common.back')}
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 h-10 flex items-center justify-center gap-2 rounded-md bg-accent text-background text-sm font-medium hover:bg-accent-muted transition-colors"
        >
          {t('calendar.calculate')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
