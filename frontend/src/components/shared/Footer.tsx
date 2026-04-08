interface FooterProps {
  text?: string;
}

export const Footer = ({ text = 'Powered by Onfly AI · dados dos últimos 90 dias' }: FooterProps) => (
  <div className="h-10 flex items-center justify-center text-[11px] text-onfly-text-muted">
    {text}
  </div>
);
