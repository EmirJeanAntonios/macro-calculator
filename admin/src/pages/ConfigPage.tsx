import { useEffect, useState } from 'react';
import {
  Save,
  Loader2,
  RotateCcw,
  Settings,
  Dumbbell,
  Activity,
  Target,
  Percent,
  Calendar,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { adminService } from '../services/api';
import type { ConfigItem, ConfigMap } from '../services/api';

const CATEGORY_INFO: Record<
  string,
  { label: string; icon: React.ElementType; color: string; description: string }
> = {
  workout_intensity: {
    label: 'Workout Intensity',
    icon: Dumbbell,
    color: 'violet',
    description: 'Intensity multipliers for different workout types (affects TDEE calculation)',
  },
  activity_level: {
    label: 'Activity Levels',
    icon: Activity,
    color: 'emerald',
    description: 'Multipliers for different activity levels based on weekly exercise',
  },
  goal_adjustment: {
    label: 'Goal Adjustments',
    icon: Target,
    color: 'rose',
    description: 'Calorie multipliers for different fitness goals',
  },
  macro_ratio: {
    label: 'Macro Ratios',
    icon: Percent,
    color: 'amber',
    description: 'Percentage of calories from each macronutrient',
  },
  special_day: {
    label: 'Special Day Settings',
    icon: Calendar,
    color: 'cyan',
    description: 'Adjustments for workout days vs rest days',
  },
};

export default function ConfigPage() {
  const [configs, setConfigs] = useState<ConfigMap>({});
  const [originalConfigs, setOriginalConfigs] = useState<ConfigMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setIsLoading(true);
    const response = await adminService.getConfigurations();
    if (response.success && response.data) {
      setConfigs(response.data);
      setOriginalConfigs(JSON.parse(JSON.stringify(response.data)));
    }
    setIsLoading(false);
  };

  const handleValueChange = (category: string, key: string, value: string) => {
    setConfigs((prev) => ({
      ...prev,
      [category]: prev[category].map((item) =>
        item.key === key ? { ...item, value: parseFloat(value) || 0 } : item
      ),
    }));
    setHasChanges(true);
    setMessage(null);
  };

  const handleReset = () => {
    setConfigs(JSON.parse(JSON.stringify(originalConfigs)));
    setHasChanges(false);
    setMessage(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    // Collect all changed configs
    const changedConfigs: { key: string; value: number }[] = [];
    Object.entries(configs).forEach(([category, items]) => {
      items.forEach((item) => {
        const original = originalConfigs[category]?.find((o) => o.key === item.key);
        const currentVal = typeof item.value === 'string' ? parseFloat(item.value) : item.value;
        const originalVal = original ? (typeof original.value === 'string' ? parseFloat(original.value) : original.value) : 0;
        if (original && Math.abs(currentVal - originalVal) > 0.0001) {
          changedConfigs.push({ key: item.key, value: currentVal });
        }
      });
    });

    if (changedConfigs.length === 0) {
      setMessage({ type: 'error', text: 'No changes to save' });
      setIsSaving(false);
      return;
    }

    const response = await adminService.updateConfigurations(changedConfigs);
    if (response.success && response.data) {
      setConfigs(response.data);
      setOriginalConfigs(JSON.parse(JSON.stringify(response.data)));
      setHasChanges(false);
      setMessage({ type: 'success', text: `Successfully updated ${changedConfigs.length} configuration(s)` });
    } else {
      setMessage({ type: 'error', text: response.error || 'Failed to save configurations' });
    }

    setIsSaving(false);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      violet: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30' },
      emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
      rose: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
      amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
      cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    };
    return colors[color] || colors.violet;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Configuration</h1>
          <p className="text-slate-400">
            Adjust calculation parameters and macro ratios
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Config Categories */}
      <div className="space-y-8">
        {Object.entries(configs).map(([category, items]) => {
          const info = CATEGORY_INFO[category] || {
            label: category,
            icon: Settings,
            color: 'violet',
            description: '',
          };
          const Icon = info.icon;
          const colors = getColorClasses(info.color);

          return (
            <div
              key={category}
              className={`bg-slate-800/50 rounded-2xl border ${colors.border} overflow-hidden`}
            >
              {/* Category Header */}
              <div className="px-6 py-4 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${colors.bg}`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">{info.label}</h2>
                    <p className="text-sm text-slate-500">{info.description}</p>
                  </div>
                </div>
              </div>

              {/* Config Items */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <ConfigInput
                    key={item.key}
                    item={item}
                    onChange={(value) => handleValueChange(category, item.key, value)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}

interface ConfigInputProps {
  item: ConfigItem;
  onChange: (value: string) => void;
}

function ConfigInput({ item, onChange }: ConfigInputProps) {
  const numericValue = typeof item.value === 'string' ? parseFloat(item.value) : item.value;
  const isRatio = item.key.includes('ratio') && !item.key.includes('multiplier');
  const displayValue = isRatio 
    ? (numericValue * 100).toFixed(1) 
    : numericValue.toFixed(2);

  const handleChange = (rawValue: string) => {
    if (isRatio) {
      onChange(String(parseFloat(rawValue) / 100));
    } else {
      onChange(rawValue);
    }
  };

  return (
    <div className="bg-slate-900/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-white">{item.label}</label>
        {isRatio && <span className="text-xs text-slate-500">%</span>}
      </div>
      <input
        type="number"
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        step={isRatio ? '1' : '0.01'}
        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
      />
      {item.description && (
        <p className="mt-2 text-xs text-slate-500">{item.description}</p>
      )}
    </div>
  );
}

