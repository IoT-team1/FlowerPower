/**
 * Vypočítá průměr, min a max z pole hodnot
 */
export const calcStats = (measurements, key) => {
  const values = measurements
    .map((m) => m[key])
    .filter((v) => v != null && !isNaN(v));

  if (!values.length) return { avg: null, min: null, max: null };

  return {
    avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10,
    min: Math.min(...values),
    max: Math.max(...values),
  };
};

/**
 * Filtruje měření podle časového rozsahu
 * @param {'24h' | '7d' | '30d'} range
 */
export const filterByRange = (measurements, range) => {
  const now = Date.now();
  const ms = {
    '24h': 24 * 60 * 60 * 1000,
    '7d':   7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };
  const limit = now - (ms[range] ?? ms['24h']);
  return measurements.filter((m) => new Date(m.timestamp).getTime() >= limit);
};