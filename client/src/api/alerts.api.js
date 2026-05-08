import client from './client';

export const getAlerts = (params = {}) =>
  client.get('/alerts', { params }).then((r) => r.data);

export const updateAlert = (id, data) =>
  client.patch(`/alerts/${id}`, data).then((r) => r.data);