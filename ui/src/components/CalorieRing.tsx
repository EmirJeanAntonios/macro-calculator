interface CalorieRingProps {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export default function CalorieRing({ calories, protein, carbs, fats }: CalorieRingProps) {
  // Calculate percentages
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatsCals = fats * 9;
  const total = proteinCals + carbsCals + fatsCals;

  const proteinPct = Math.round((proteinCals / total) * 100);
  const carbsPct = Math.round((carbsCals / total) * 100);
  const fatsPct = 100 - proteinPct - carbsPct;

  // SVG circle calculations
  const size = 200;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const proteinOffset = 0;
  const carbsOffset = (proteinPct / 100) * circumference;
  const fatsOffset = ((proteinPct + carbsPct) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgb(51 65 85 / 0.5)"
          strokeWidth={strokeWidth}
        />

        {/* Protein segment */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#6366f1"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (proteinPct / 100) * circumference}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />

        {/* Carbs segment */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (carbsPct / 100) * circumference}
          transform={`rotate(${(proteinPct / 100) * 360} ${size / 2} ${size / 2})`}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />

        {/* Fats segment */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ef4444"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (fatsPct / 100) * circumference}
          transform={`rotate(${((proteinPct + carbsPct) / 100) * 360} ${size / 2} ${size / 2})`}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">{calories}</span>
        <span className="text-slate-400 text-sm">kcal/day</span>
      </div>
    </div>
  );
}

