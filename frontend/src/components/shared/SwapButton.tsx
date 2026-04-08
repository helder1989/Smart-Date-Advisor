import { useState } from 'react';

interface SwapButtonProps {
  onSwap: () => void;
}

export const SwapButton = ({ onSwap }: SwapButtonProps) => {
  const [rotated, setRotated] = useState(false);

  const handleClick = () => {
    setRotated(prev => !prev);
    onSwap();
  };

  return (
    <div className="flex justify-center -my-1 relative z-10">
      <button
        type="button"
        onClick={handleClick}
        aria-label="Trocar origem e destino"
        className="w-8 h-8 rounded-full border border-onfly-border bg-card flex items-center justify-center text-primary hover:bg-background transition-all duration-300 cursor-pointer"
        style={{ transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M7.5 21.5L3 17l4.5-4.5M3 17h18M16.5 2.5L21 7l-4.5 4.5M21 7H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};
