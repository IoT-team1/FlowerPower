/**
 * Formátování datumu a času
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
 * Relativní čas
 * před 8 minutami, před 2 hodinami, včera...
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
 * Formátování hodnoty senzoru
 * null / undefined → "—"
 */
export const formatValue = (value, unit) =>
  value != null ? `${value}${unit}` : '—';

/**
 * Formátování teploty
 */
export const formatTemp = (value) => formatValue(value, '°C');

/**
 * Formátování vlhkosti
 */
export const formatHumidity = (value) => formatValue(value, '%');

/**
 * Formátování grafů
 */
export const formatChartTime = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString('cs-CZ', {
    hour: '2-digit',
    minute: '2-digit',
  });
};