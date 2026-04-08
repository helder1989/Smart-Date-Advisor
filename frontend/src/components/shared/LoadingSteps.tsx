interface LoadingStepsProps {
  onComplete: () => void;
}

import { useState, useEffect } from 'react';

interface StepState {
  text: string;
  started: boolean;
  done: boolean;
}

export const LoadingSteps = ({ onComplete }: LoadingStepsProps) => {
  const [steps, setSteps] = useState<StepState[]>([
    { text: 'Buscando as melhores opcoes...', started: false, done: false },
    { text: 'Comparando precos e datas...', started: false, done: false },
    { text: 'Combinando tudo para voce...', started: false, done: false },
  ]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Step 1: start immediately, done at 700ms
    timers.push(setTimeout(() => setSteps(s => s.map((st, i) => i === 0 ? { ...st, started: true } : st)), 0));
    timers.push(setTimeout(() => setSteps(s => s.map((st, i) => i === 0 ? { ...st, done: true } : st)), 700));

    // Step 2: start at 800ms, done at 1500ms
    timers.push(setTimeout(() => setSteps(s => s.map((st, i) => i === 1 ? { ...st, started: true } : st)), 800));
    timers.push(setTimeout(() => setSteps(s => s.map((st, i) => i === 1 ? { ...st, done: true } : st)), 1500));

    // Step 3: start at 1600ms, done at 2300ms
    timers.push(setTimeout(() => setSteps(s => s.map((st, i) => i === 2 ? { ...st, started: true } : st)), 1600));
    timers.push(setTimeout(() => setSteps(s => s.map((st, i) => i === 2 ? { ...st, done: true } : st)), 2300));

    timers.push(setTimeout(onComplete, 2800));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="space-y-3.5 w-[260px] mx-auto">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            {!step.started ? (
              <div className="w-5 h-5 rounded-full border-2 border-onfly-border" />
            ) : step.done ? (
              <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center animate-pop-in">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
                </svg>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-onfly-border border-t-primary animate-spin-loader" />
            )}
          </div>
          <span className={`text-[13px] ${step.done ? 'text-foreground' : 'text-onfly-text-secondary'}`}>
            {step.text}
          </span>
        </div>
      ))}
    </div>
  );
};
