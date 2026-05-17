import { useState, useEffect } from 'react';
import { getMeasurements } from '../api/measurements.api';

export function useMeasurements(plantId, params = {}) {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!plantId) return;
    setLoading(true);
    getMeasurements(plantId, params)
      .then((data) => {
        const sorted = [...data].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setMeasurements(sorted);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [plantId]);

  return { measurements, loading, error };
}