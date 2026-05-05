import client from './client';

export const getPlants = () =>
  client.get('/plants').then((r) => r.data);

export const getPlant = (id) =>
  client.get(`/plants/${id}`).then((r) => r.data);