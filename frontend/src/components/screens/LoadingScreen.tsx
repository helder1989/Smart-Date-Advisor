import { useCallback } from 'react';
import { Header } from '../shared/Header';
import { LoadingSteps } from '../shared/LoadingSteps';

interface LoadingScreenProps {
  userInitials: string;
  onComplete: () => void;
}

export const LoadingScreen = ({ userInitials, onComplete }: LoadingScreenProps) => {
  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-background flex flex-col animate-fade-slide-up">
      <Header userInitials={userInitials} />
      <div className="flex-1 flex flex-col items-center pt-12">
        {/* Animated airplane */}
        <div className="w-[120px] h-[40px] relative">
          <svg width="120" height="40" viewBox="0 0 120 40" className="overflow-visible">
            <path d="M10 30 Q60 5 110 30" stroke="hsl(214 100% 40%)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.3" />
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="absolute text-primary animate-fly-plane" style={{ top: '4px', left: '0' }}>
            <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0011.5 2 1.5 1.5 0 0010 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor"/>
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-foreground mt-6">Analisando...</h2>
        <p className="text-sm text-onfly-text-secondary mt-1.5 max-w-[260px] text-center">
          Consultando histórico de preços e calculando as melhores combinações
        </p>

        <div className="mt-8">
          <LoadingSteps onComplete={handleComplete} />
        </div>
      </div>
    </div>
  );
};
