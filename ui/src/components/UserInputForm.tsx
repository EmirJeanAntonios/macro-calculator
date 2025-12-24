import { useState } from 'react';
import { User, Scale, Ruler, Target } from 'lucide-react';
import type { UserInput, WeightUnit, HeightUnit } from '../types';

interface UserInputFormProps {
  onSubmit: (data: UserInput) => void;
  initialData?: Partial<UserInput>;
}

export default function UserInputForm({ onSubmit, initialData }: UserInputFormProps) {
  const [formData, setFormData] = useState<UserInput>({
    age: initialData?.age || 25,
    gender: initialData?.gender || 'male',
    weight: initialData?.weight || 70,
    weightUnit: initialData?.weightUnit || 'kg',
    height: initialData?.height || 170,
    heightUnit: initialData?.heightUnit || 'cm',
    goal: initialData?.goal || 'maintenance',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserInput, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserInput, string>> = {};

    if (formData.age < 13 || formData.age > 120) {
      newErrors.age = 'Age must be between 13 and 120';
    }

    if (formData.weight <= 0 || formData.weight > 700) {
      newErrors.weight = 'Please enter a valid weight';
    }

    if (formData.height <= 0 || formData.height > 300) {
      newErrors.height = 'Please enter a valid height';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const updateField = <K extends keyof UserInput>(field: K, value: UserInput[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Age & Gender Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Age */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <User className="w-4 h-4 text-emerald-400" />
            Age
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => updateField('age', parseInt(e.target.value) || 0)}
            className={`w-full px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
              errors.age
                ? 'border-red-500 focus:ring-red-500/50'
                : 'border-slate-700 focus:ring-emerald-500/50 focus:border-emerald-500'
            }`}
            placeholder="Enter your age"
            min={13}
            max={120}
          />
          {errors.age && <p className="text-red-400 text-sm">{errors.age}</p>}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <User className="w-4 h-4 text-cyan-400" />
            Biological Gender
          </label>
          <div className="grid grid-cols-2 gap-3">
            <GenderButton
              selected={formData.gender === 'male'}
              onClick={() => updateField('gender', 'male')}
              label="Male"
            />
            <GenderButton
              selected={formData.gender === 'female'}
              onClick={() => updateField('gender', 'female')}
              label="Female"
            />
          </div>
        </div>
      </div>

      {/* Weight */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Scale className="w-4 h-4 text-indigo-400" />
          Weight
        </label>
        <div className="flex gap-3">
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => updateField('weight', parseFloat(e.target.value) || 0)}
            className={`flex-1 px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
              errors.weight
                ? 'border-red-500 focus:ring-red-500/50'
                : 'border-slate-700 focus:ring-emerald-500/50 focus:border-emerald-500'
            }`}
            placeholder="Enter your weight"
            step="0.1"
          />
          <UnitToggle
            options={[
              { value: 'kg', label: 'kg' },
              { value: 'lbs', label: 'lbs' },
            ]}
            value={formData.weightUnit}
            onChange={(value) => updateField('weightUnit', value as WeightUnit)}
          />
        </div>
        {errors.weight && <p className="text-red-400 text-sm">{errors.weight}</p>}
      </div>

      {/* Height */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Ruler className="w-4 h-4 text-amber-400" />
          Height
        </label>
        <div className="flex gap-3">
          <input
            type="number"
            value={formData.height}
            onChange={(e) => updateField('height', parseFloat(e.target.value) || 0)}
            className={`flex-1 px-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
              errors.height
                ? 'border-red-500 focus:ring-red-500/50'
                : 'border-slate-700 focus:ring-emerald-500/50 focus:border-emerald-500'
            }`}
            placeholder="Enter your height"
            step="0.1"
          />
          <UnitToggle
            options={[
              { value: 'cm', label: 'cm' },
              { value: 'ft', label: 'ft' },
            ]}
            value={formData.heightUnit}
            onChange={(value) => updateField('heightUnit', value as HeightUnit)}
          />
        </div>
        {errors.height && <p className="text-red-400 text-sm">{errors.height}</p>}
      </div>

      {/* Goal */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Target className="w-4 h-4 text-rose-400" />
          Your Goal
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <GoalButton
            selected={formData.goal === 'weight_loss'}
            onClick={() => updateField('goal', 'weight_loss')}
            label="Weight Loss"
            description="Calorie deficit"
            color="rose"
          />
          <GoalButton
            selected={formData.goal === 'maintenance'}
            onClick={() => updateField('goal', 'maintenance')}
            label="Maintenance"
            description="Maintain weight"
            color="amber"
          />
          <GoalButton
            selected={formData.goal === 'muscle_gain'}
            onClick={() => updateField('goal', 'muscle_gain')}
            label="Muscle Gain"
            description="Calorie surplus"
            color="emerald"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/25"
      >
        Continue to Workout Schedule
      </button>
    </form>
  );
}

// Helper Components
function GenderButton({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 rounded-xl font-medium transition-all ${
        selected
          ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-500 text-emerald-400'
          : 'bg-slate-800/50 border-2 border-slate-700 text-slate-400 hover:border-slate-600'
      }`}
    >
      {label}
    </button>
  );
}

function UnitToggle({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`px-4 py-3 font-medium transition-all ${
            value === option.value
              ? 'bg-emerald-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function GoalButton({
  selected,
  onClick,
  label,
  description,
  color,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  description: string;
  color: 'rose' | 'amber' | 'emerald';
}) {
  const colorClasses = {
    rose: {
      selected: 'from-rose-500/20 to-pink-500/20 border-rose-500 text-rose-400',
      icon: 'text-rose-400',
    },
    amber: {
      selected: 'from-amber-500/20 to-orange-500/20 border-amber-500 text-amber-400',
      icon: 'text-amber-400',
    },
    emerald: {
      selected: 'from-emerald-500/20 to-teal-500/20 border-emerald-500 text-emerald-400',
      icon: 'text-emerald-400',
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-4 rounded-xl text-left transition-all ${
        selected
          ? `bg-gradient-to-r ${colorClasses[color].selected} border-2`
          : 'bg-slate-800/50 border-2 border-slate-700 text-slate-400 hover:border-slate-600'
      }`}
    >
      <div className={`font-semibold ${selected ? colorClasses[color].icon : ''}`}>
        {label}
      </div>
      <div className="text-sm opacity-70">{description}</div>
    </button>
  );
}

