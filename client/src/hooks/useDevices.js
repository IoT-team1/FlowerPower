import { useState, useEffect } from 'react';
import { getDevices, getDevice } from '../api/devices.api';

export function useDevices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDevices()
      .then(setDevices)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { devices, loading, error };
}

export function useDevice(id) {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDevice(id)
      .then(setDevice)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  return { device, loading, error };
}