import client from './client';

export const getMeasurements = (gatewayId, params = {}) =>
  client.get('/measurements', { params: { gatewayId, ...params } }).then((r) => r.data);