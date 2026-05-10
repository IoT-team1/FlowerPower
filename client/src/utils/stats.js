/**
 * Counts average, min and max values for a given key
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
 * Filtering measurements by time range
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

/**
 * Compiling buckets for avg values
 * 24h → avg for each hour (24 bodů)
 * 7d  → avg for each day (7 bodů)
 * 30d → avg for each day (30 bodů)
 */
export const aggregateMeasurements = (measurements, range) => {
  if (!measurements.length) return [];

  const now = new Date();
  const buckets = [];

  if (range === '24h') {
    // 24 buckets - each hour
    for (let i = 23; i >= 0; i--) {
      const from = new Date(now);
      from.setHours(now.getHours() - i, 0, 0, 0);
      const to = new Date(from);
      to.setHours(from.getHours() + 1);

      buckets.push({
        label: from.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }),
        from,
        to,
      });
    }
  } else if (range === '7d') {
    // 7 buckets - wach day
    for (let i = 6; i >= 0; i--) {
      const from = new Date(now);
      from.setDate(now.getDate() - i);
      from.setHours(0, 0, 0, 0);
      const to = new Date(from);
      to.setDate(from.getDate() + 1);

      buckets.push({
        label: from.toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric' }),
        from,
        to,
      });
    }
  } else if (range === '30d') {
    // 30 buckets - each day
    for (let i = 29; i >= 0; i--) {
      const from = new Date(now);
      from.setDate(now.getDate() - i);
      from.setHours(0, 0, 0, 0);
      const to = new Date(from);
      to.setDate(from.getDate() + 1);

      buckets.push({
        label: from.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' }),
        from,
        to,
      });
    }
  }

  // Counts avg for each bucket
  return buckets.map(({ label, from, to }) => {
    const inBucket = measurements.filter((m) => {
      const t = new Date(m.timestamp);
      return t >= from && t < to;
    });

    if (!inBucket.length) return { label, temperature: null, humidity: null };

    const avg = (key) =>
      Math.round(
        (inBucket.reduce((sum, m) => sum + (m[key] ?? 0), 0) / inBucket.length) * 10
      ) / 10;

    return {
      label,
      temperature: avg('temperature'),
      humidity:    avg('humidity'),
      moisture:    avg('moisture'),
    };
  });
};