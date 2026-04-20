import { Sun, Sunset, LucideIcon } from 'lucide-react';

/**
 * Determines if a time string (e.g., "3:30 PM") qualifies as late afternoon.
 * Threshold: 3:00 PM or later (excluding 12:00 PM).
 */
export const getTimeOfDayAssets = (
  time: string,
): {
  TimeIcon: LucideIcon;
  isLateAfternoon: boolean;
} => {
  if (!time) {
    return {
      TimeIcon: Sun,
      isLateAfternoon: false,
    };
  }

  const hour = parseInt(time.split(':')[0], 10);
  const isPM = time.toLowerCase().includes('pm');
  const isLateAfternoon = isPM && hour >= 3 && hour !== 12;

  return {
    TimeIcon: isLateAfternoon ? Sunset : Sun,
    isLateAfternoon,
  };
};
