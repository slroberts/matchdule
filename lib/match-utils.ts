import { Radio, CheckCircle2, XCircle, LucideIcon } from 'lucide-react';
import { MatchStatus } from '@/types/match';

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  className: string;
}

export const getStatusConfig = (status: MatchStatus): StatusConfig | null => {
  const configs: Record<string, StatusConfig> = {
    live: {
      label: 'LIVE',
      icon: Radio,
      className: 'text-status-conflict animate-pulse font-black',
    },
    final: {
      label: 'FINAL',
      icon: CheckCircle2,
      className: 'text-surface-muted font-bold',
    },
    canceled: {
      label: 'CANCELED',
      icon: XCircle,
      className: 'text-status-conflict line-through opacity-70',
    },
  };

  return configs[status] || null;
};
