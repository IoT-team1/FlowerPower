/**
 * Counts threshold status for a given value
 * @returns {'ok' | 'low' | 'high' | 'unknown'}
 */
export const getThresholdStatus = (value, min, max) => {
  if (value == null || min == null || max == null) return 'unknown';
  if (value < min) return 'low';
  if (value > max) return 'high';
  return 'ok';
};

/**
 * Tailwind for classes for threshold status
 */
export const thresholdStyles = {
  ok:      { text: 'text-gray-900',  badge: 'bg-green-50 text-green-900',  label: 'v normě' },
  low:     { text: 'text-amber-700', badge: 'bg-amber-50 text-amber-900',  label: 'příliš nízká' },
  high:    { text: 'text-red-500',   badge: 'bg-red-50 text-red-700',      label: 'příliš vysoká' },
  unknown: { text: 'text-gray-400',  badge: 'bg-gray-100 text-gray-400',   label: '—' },
};

/**
 * Styles for concrete values
 */
export const getThresholdStyles = (value, min, max) =>
  thresholdStyles[getThresholdStatus(value, min, max)];

