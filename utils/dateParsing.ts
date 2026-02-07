import { addDays, nextFriday, format } from 'date-fns';

export const parseNaturalDate = (text: string): string | null => {
  const lower = text.toLowerCase().trim();
  const now = new Date();

  if (lower === 'tomorrow') {
      return format(addDays(now, 1), 'yyyy-MM-dd');
  }
  if (lower === 'next friday') {
      return format(nextFriday(now), 'yyyy-MM-dd');
  }
  if (lower === 'today') {
      return format(now, 'yyyy-MM-dd');
  }
  // Add more heuristics here or use a library like chrono-node if needed for complex parsing
  return null;
};
