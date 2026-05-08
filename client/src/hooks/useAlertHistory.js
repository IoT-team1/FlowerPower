import { useState, useEffect } from 'react';
import { getAlerts } from '../api/alerts.api';

export function useAlertHistory(plantId) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!plantId) {
      setAlerts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getAlerts({ plantId })
      .then((data) => {
        const sorted = [...data].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setAlerts(sorted);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [plantId]);

  console.log('useAlertHistory666666:', alerts);
  return { alerts, loading, error };
}