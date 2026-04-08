import { WizardStep, ITripPlan } from '../../interfaces/models/ICommon';
import { Plane, Building2, Car, Check } from 'lucide-react';

interface WizardProgressProps {
  currentStep: WizardStep;
  tripPlan: ITripPlan;
}

const steps = [
  { step: 1 as WizardStep, label: 'Transporte', icon: Plane },
  { step: 2 as WizardStep, label: 'Hospedagem', icon: Building2 },
  { step: 3 as WizardStep, label: 'Carro', icon: Car },
];

export function WizardProgress({ currentStep, tripPlan }: WizardProgressProps) {
  const isCompleted = (step: WizardStep) => {
    if (step === 1) return currentStep > 1;
    if (step === 2) return currentStep > 2;
    return false;
  };

  const hasData = (step: WizardStep) => {
    if (step === 1) return !!tripPlan.transport;
    if (step === 2) return !!tripPlan.hotel;
    if (step === 3) return !!tripPlan.car;
    return false;
  };

  return (
    <div className="flex items-center justify-between px-2 py-3">
      {steps.map(({ step, label, icon: Icon }, index) => {
        const completed = isCompleted(step);
        const active = currentStep === step;
        const filled = hasData(step);

        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                  ${active
                    ? 'bg-primary text-primary-foreground shadow-md scale-110'
                    : completed && filled
                      ? 'bg-primary/90 text-primary-foreground'
                      : completed
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-muted/50 text-muted-foreground/50'
                  }
                `}
              >
                {completed && filled ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={`
                  text-[10px] font-medium transition-colors duration-300
                  ${active ? 'text-primary' : completed ? 'text-muted-foreground' : 'text-muted-foreground/50'}
                `}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  h-[2px] flex-1 -mt-4 mx-1 rounded-full transition-colors duration-300
                  ${completed ? (filled ? 'bg-primary/60' : 'bg-muted') : 'bg-muted/30'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
