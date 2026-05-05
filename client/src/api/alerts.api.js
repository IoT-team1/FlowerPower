import client from './client';

export const getAlerts = (plantId, params = {}) =>
  client.get('/alerts', { params: { plantId, ...params } }).then((r) => r.data);

export const markAlertResolved = (id) =>
  client.patch(`/alerts/${id}/resolve`).then((r) => r.data);