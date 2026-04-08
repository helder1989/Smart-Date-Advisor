import { OnflyLogoSmall } from '../icons/OnflyLogo';

interface HeaderProps {
  userInitials: string;
}

export const Header = ({ userInitials }: HeaderProps) => (
  <div className="h-14 flex items-center justify-between px-4 border-b border-onfly-border bg-card">
    <OnflyLogoSmall />
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold"
      style={{ backgroundColor: '#EBF2FF', color: 'hsl(214 100% 40%)' }}
    >
      {userInitials}
    </div>
  </div>
);
