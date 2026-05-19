import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetaItemProps {
  icon: LucideIcon;
  label: string | number;
  iconColor?: string;
  className?: string;
}

export const MetaItem = ({
  icon: Icon,
  label,
  iconColor = 'text-brand-primary',
  className = '',
}: MetaItemProps) => {
  return (
    <div className={cn('flex items-center gap-1 min-w-0', className)}>
      <Icon size={14} className={cn('shrink-0', iconColor)} />

      <span className='text-brand-navy truncate'>{label}</span>
    </div>
  );
};
