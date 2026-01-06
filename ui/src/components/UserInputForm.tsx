import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import type { UserInput, WeightUnit, HeightUnit } from '../types';

interface UserInputFormProps {
  onSubmit: (data: UserInput) => void;
  initialData?: Partial<UserInput>;
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function UserInputForm({ onSubmit, initialData }: UserInputFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<UserInput>({
    age: initialData?.age || 25,
    gender: initialData?.gender || 'male',
    weight: initialData?.weight || 70,
    weightUnit: initialData?.weightUnit || 'kg',
    height: initialData?.height || 170,
    heightUnit: initialData?.heightUnit || 'cm',
    goal: initialData?.goal || 'maintenance',
  });

  const [inputValues, setInputValues] = useState({
    age: String(initialData?.age || 25),
    weight: String(initialData?.weight || 70),
    height: String(initialData?.height || 170),
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserInput, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserInput, string>> = {};
    const age = parseFloat(inputValues.age) || 0;
    const weight = parseFloat(inputValues.weight) || 0;
    const height = parseFloat(inputValues.height) || 0;

    if (age < 13 || age > 120) newErrors.age = t('form.validation.ageRange');
    if (weight <= 0 || weight > 700) newErrors.weight = t('form.validation.validWeight');
    if (height <= 0 || height > 300) newErrors.height = t('form.validation.validHeight');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFormData = {
      ...formData,
      age: parseInt(inputValues.age) || 0,
      weight: parseFloat(inputValues.weight) || 0,
      height: parseFloat(inputValues.height) || 0,
    };
    setFormData(updatedFormData);
    if (validateForm()) onSubmit(updatedFormData);
  };

  const updateField = <K extends keyof UserInput>(field: K, value: UserInput[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const updateNumberInput = (field: 'age' | 'weight' | 'height', value: string) => {
    setInputValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Age & Gender */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-text-muted mb-1.5">{t('form.age')}</label>
          <input
            type="number"
            value={inputValues.age}
            onChange={(e) => updateNumberInput('age', e.target.value)}
            className={cn(
              "w-full h-10 px-3 rounded-md bg-surface-muted border text-sm text-text-primary",
              "placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent transition-colors",
              errors.age ? "border-error" : "border-border-subtle"
            )}
            min={13}
            max={120}
          />
          {errors.age && <p className="mt-1 text-xs text-error">{errors.age}</p>}
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1.5">{t('form.gender')}</label>
          <div className="grid grid-cols-2 gap-2">
            {['male', 'female'].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => updateField('gender', g as 'male' | 'female')}
                className={cn(
                  "h-10 rounded-md text-sm font-medium transition-colors",
                  formData.gender === g
                    ? "bg-accent text-background"
                    : "bg-surface-muted border border-border-subtle text-text-secondary hover:text-text-primary"
                )}
              >
                {t(`form.${g}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Weight */}
      <div>
        <label className="block text-xs text-text-muted mb-1.5">{t('form.weight')}</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={inputValues.weight}
            onChange={(e) => updateNumberInput('weight', e.target.value)}
            className={cn(
              "flex-1 h-10 px-3 rounded-md bg-surface-muted border text-sm text-text-primary",
              "placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent transition-colors",
              errors.weight ? "border-error" : "border-border-subtle"
            )}
            step="0.1"
          />
          <div className="flex bg-surface-muted border border-border-subtle rounded-md overflow-hidden">
            {(['kg', 'lbs'] as WeightUnit[]).map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => updateField('weightUnit', unit)}
                className={cn(
                  "w-12 h-10 text-sm font-medium transition-colors",
                  formData.weightUnit === unit
                    ? "bg-accent text-background"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
        {errors.weight && <p className="mt-1 text-xs text-error">{errors.weight}</p>}
      </div>

      {/* Height */}
      <div>
        <label className="block text-xs text-text-muted mb-1.5">{t('form.height')}</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={inputValues.height}
            onChange={(e) => updateNumberInput('height', e.target.value)}
            className={cn(
              "flex-1 h-10 px-3 rounded-md bg-surface-muted border text-sm text-text-primary",
              "placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent transition-colors",
              errors.height ? "border-error" : "border-border-subtle"
            )}
            step="0.1"
          />
          <div className="flex bg-surface-muted border border-border-subtle rounded-md overflow-hidden">
            {(['cm', 'ft'] as HeightUnit[]).map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => updateField('heightUnit', unit)}
                className={cn(
                  "w-12 h-10 text-sm font-medium transition-colors",
                  formData.heightUnit === unit
                    ? "bg-accent text-background"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
        {errors.height && <p className="mt-1 text-xs text-error">{errors.height}</p>}
      </div>

      {/* Goal */}
      <div>
        <label className="block text-xs text-text-muted mb-1.5">{t('form.goal')}</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'weight_loss', label: t('form.weightLoss') },
            { key: 'maintenance', label: t('form.maintenance') },
            { key: 'muscle_gain', label: t('form.muscleGain') },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => updateField('goal', key as UserInput['goal'])}
              className={cn(
                "h-10 rounded-md text-sm font-medium transition-colors",
                formData.goal === key
                  ? "bg-accent text-background"
                  : "bg-surface-muted border border-border-subtle text-text-secondary hover:text-text-primary"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full h-11 mt-4 flex items-center justify-center gap-2 rounded-md bg-accent text-background text-sm font-medium hover:bg-accent-muted transition-colors"
      >
        {t('form.continue')}
        <ChevronRight className="w-4 h-4" />
      </button>
    </form>
  );
}
