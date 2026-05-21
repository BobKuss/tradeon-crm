import type { MarginQualityScore } from '@/lib/types';
import { ft } from '@/lib/finance-translations';

interface Props {
  score: MarginQualityScore;
  size?: 'sm' | 'md';
}

const SCORE_STYLES: Record<MarginQualityScore, { bg: string; text: string; dot: string }> = {
  CRITICAL:  { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500'    },
  LOW:       { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  MEDIUM:    { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  GOOD:      { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500'  },
  EXCELLENT: { bg: 'bg-teal-50',   text: 'text-teal-700',   dot: 'bg-teal-500'   },
};

const SCORE_LABELS: Record<MarginQualityScore, string> = {
  CRITICAL:  ft['score.critical'],
  LOW:       ft['score.low'],
  MEDIUM:    ft['score.medium'],
  GOOD:      ft['score.good'],
  EXCELLENT: ft['score.excellent'],
};

export function MarginQualityBadge({ score, size = 'md' }: Props) {
  const s = SCORE_STYLES[score];
  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${px} ${s.bg} ${s.text}`}>
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      {SCORE_LABELS[score]}
    </span>
  );
}

export { SCORE_STYLES, SCORE_LABELS };
