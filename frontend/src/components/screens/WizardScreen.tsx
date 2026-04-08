import { useCallback, useRef } from 'react';
import { WizardStep, TransportType, ITripPlan } from '../../interfaces/models/ICommon';
import { IFlightSearchParams } from '../../interfaces/models/IFlight';
import { IBusSearchParams } from '../../interfaces/models/IBus';
import { IHotelSearchParams } from '../../interfaces/models/IHotel';
import { ICarSearchParams } from '../../interfaces/models/ICar';
import { Header } from '../shared/Header';
import { Footer } from '../shared/Footer';
import { WizardProgress } from '../shared/WizardProgress';
import { WizardNavigation } from '../shared/WizardNavigation';
import { TransportStep } from '../wizard/TransportStep';
import { HotelStep } from '../wizard/HotelStep';
import { CarStep } from '../wizard/CarStep';

interface WizardScreenProps {
  userInitials: string;
  currentStep: WizardStep;
  tripPlan: ITripPlan;
  hasSelections: boolean;
  loading: boolean;
  onTransportChange: (type: TransportType, params: IFlightSearchParams | IBusSearchParams) => void;
  onHotelChange: (params: IHotelSearchParams) => void;
  onCarChange: (params: ICarSearchParams) => void;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onSubmit: () => void;
}

const STEP_TITLES: Record<WizardStep, { title: string; subtitle: string }> = {
  1: { title: 'Como voce vai viajar?', subtitle: 'Escolha o transporte da sua viagem' },
  2: { title: 'Onde voce vai se hospedar?', subtitle: 'Encontre o hotel ideal para sua estadia' },
  3: { title: 'Precisa de um carro?', subtitle: 'Alugue um carro para se locomover' },
};

export function WizardScreen({
  userInitials,
  currentStep,
  tripPlan,
  hasSelections,
  loading,
  onTransportChange,
  onHotelChange,
  onCarChange,
  onNext,
  onPrev,
  onSkip,
  onSubmit,
}: WizardScreenProps) {
  const { title, subtitle } = STEP_TITLES[currentStep];

  return (
    <div className="min-h-screen bg-background flex flex-col animate-fade-slide-up">
      <Header userInitials={userInitials} />
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h1 className="text-base font-semibold text-foreground">Planejador de Viagem</h1>
        <p className="text-[13px] text-onfly-text-secondary mt-0.5">
          Monte sua viagem ideal passo a passo
        </p>

        <div className="mt-3">
          <WizardProgress currentStep={currentStep} tripPlan={tripPlan} />
        </div>

        <div className="mt-3">
          <h2 className="text-[14px] font-semibold text-foreground">{title}</h2>
          <p className="text-[12px] text-onfly-text-muted mt-0.5">{subtitle}</p>
        </div>

        <div className="mt-4" key={currentStep}>
          {currentStep === 1 && <TransportStep onTransportChange={onTransportChange} />}
          {currentStep === 2 && <HotelStep onHotelChange={onHotelChange} />}
          {currentStep === 3 && <CarStep onCarChange={onCarChange} />}
        </div>

        <WizardNavigation
          currentStep={currentStep}
          hasSelections={hasSelections}
          loading={loading}
          onNext={onNext}
          onPrev={onPrev}
          onSkip={onSkip}
          onSubmit={onSubmit}
        />
      </div>
      <Footer />
    </div>
  );
}
