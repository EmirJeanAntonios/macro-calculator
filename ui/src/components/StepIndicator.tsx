import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Circle */}
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                isCompleted
                  ? 'bg-emerald-500 text-white'
                  : isCurrent
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-800 text-slate-500 border-2 border-slate-700'
              }`}
            >
              {isCompleted ? <Check className="w-5 h-5" /> : step.id}
            </div>

            {/* Step Label */}
            <span
              className={`ml-2 text-sm font-medium hidden sm:block ${
                isCurrent ? 'text-white' : 'text-slate-500'
              }`}
            >
              {step.label}
            </span>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`w-8 sm:w-16 h-0.5 mx-3 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

