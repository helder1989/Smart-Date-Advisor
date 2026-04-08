import { WizardStep } from '../../interfaces/models/ICommon';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface WizardNavigationProps {
  currentStep: WizardStep;
  hasSelections: boolean;
  loading: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onSubmit: () => void;
}

const STEP_LABELS: Record<WizardStep, string> = {
  1: 'Transporte',
  2: 'Hospedagem',
  3: 'Carro',
};

export function WizardNavigation({
  currentStep,
  hasSelections,
  loading,
  onNext,
  onPrev,
  onSkip,
  onSubmit,
}: WizardNavigationProps) {
  const isLastStep = currentStep === 3;

  return (
    <div className="flex flex-col gap-2 mt-5">
      {isLastStep ? (
        <button
          onClick={onSubmit}
          disabled={loading || !hasSelections}
          className="w-full h-12 rounded-[10px] bg-primary text-primary-foreground font-semibold text-[15px] hover:bg-onfly-blue-hover active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4" />
          Planejar Viagem
        </button>
      ) : (
        <button
          onClick={onNext}
          className="w-full h-12 rounded-[10px] bg-primary text-primary-foreground font-semibold text-[15px] hover:bg-onfly-blue-hover active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          Continuar
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-center justify-between">
        {currentStep > 1 ? (
          <button
            onClick={onPrev}
            className="text-sm text-onfly-text-secondary hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Voltar
          </button>
        ) : (
          <span />
        )}

        {!isLastStep && (
          <button
            onClick={onSkip}
            className="text-sm text-onfly-text-muted hover:text-onfly-text-secondary transition-colors cursor-pointer"
          >
            Pular {STEP_LABELS[currentStep]}
          </button>
        )}
      </div>
    </div>
  );
}
