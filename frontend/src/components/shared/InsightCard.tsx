import { IInsight } from '../../interfaces/models/ICommon';

interface InsightCardProps {
  insight: IInsight;
}

export const InsightCard = ({ insight }: InsightCardProps) => (
  <div
    className="rounded-xl p-3 border border-onfly-info-border mb-4"
    style={{ background: 'linear-gradient(135deg, #EBF2FF, #F5F9FF)' }}
  >
    <div className="flex items-center gap-1.5">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary">
        <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" fill="currentColor"/>
      </svg>
      <span className="text-[13px] font-semibold text-primary">{insight.title}</span>
    </div>
    <p className="text-[13px] text-onfly-info-text leading-relaxed mt-2">
      {insight.description}
    </p>
  </div>
);
