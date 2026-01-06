import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step Indicator */}
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                isCompleted && "bg-accent text-background",
                isCurrent && "bg-surface-elevated border border-accent text-accent",
                !isCompleted && !isCurrent && "bg-surface-muted border border-border-subtle text-text-muted"
              )}
            >
              {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.id}
            </div>

            {/* Label */}
            <span
              className={cn(
                "ml-2 text-xs hidden sm:block transition-colors",
                isCurrent ? "text-text-primary" : "text-text-muted"
              )}
            >
              {step.label}
            </span>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 sm:w-12 h-px mx-3",
                  isCompleted ? "bg-accent" : "bg-border-subtle"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
