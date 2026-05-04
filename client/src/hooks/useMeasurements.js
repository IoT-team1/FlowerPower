import { useState, useEffect } from 'react';
import { getMeasurements } from '../api/measurements.api';

export function useMeasurements(deviceId, params = {}) {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!deviceId) return;
    setLoading(true);
    getMeasurements(deviceId, params)
      .then(setMeasurements)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [deviceId]);

  return { measurements, loading, error };
}