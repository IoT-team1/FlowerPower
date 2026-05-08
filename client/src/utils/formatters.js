/**
 * Date and time formatting
 * new Date(m.createdAt) → "12. 5. 2025, 14:20"
 */
export const formatDateTime = (date) => {
  if (!date) return '—';
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return '—'; // ← zachytí invalid date
  return parsed.toLocaleString('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Relative time formatting
 *
 */
export const formatRelativeTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours   = Math.floor(diff / 3_600_000);
  const days    = Math.floor(diff / 86_400_000);

  if (minutes < 1)  return 'právě teď';
  if (minutes < 60) return `před ${minutes} min`;
  if (hours < 24)   return `před ${hours} hod`;
  if (days === 1)   return 'včera';
  return `před ${days} dny`;
};

/**
 * Charts time formatting
 */
export const formatChartTime = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString('cs-CZ', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};