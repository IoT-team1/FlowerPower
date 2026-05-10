import { useState, useEffect } from 'react';
import { getPlants, getPlant } from '../api/plants.api';

export function usePlants() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPlants()
      .then(setPlants)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { plants, loading, error };
}

export function usePlant(id) {
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPlant(id)
      .then(setPlant)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  return { plant, loading, error };
}