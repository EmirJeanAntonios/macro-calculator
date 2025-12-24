interface MacroCardProps {
  label: string;
  value: number;
  unit: string;
  color: 'emerald' | 'indigo' | 'amber' | 'rose';
  percentage?: number;
}

const colorClasses = {
  emerald: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    bar: 'bg-emerald-500',
  },
  indigo: {
    bg: 'bg-indigo-500/20',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
    bar: 'bg-indigo-500',
  },
  amber: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    bar: 'bg-amber-500',
  },
  rose: {
    bg: 'bg-rose-500/20',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    bar: 'bg-rose-500',
  },
};

export default function MacroCard({
  label,
  value,
  unit,
  color,
  percentage,
}: MacroCardProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={`${colors.bg} ${colors.border} border rounded-2xl p-5 transition-transform hover:scale-105`}
    >
      <div className="text-sm text-slate-400 mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold ${colors.text}`}>{value}</span>
        <span className="text-slate-500">{unit}</span>
      </div>
      {percentage !== undefined && (
        <div className="mt-3">
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 mt-1">{percentage}% of calories</div>
        </div>
      )}
    </div>
  );
}

