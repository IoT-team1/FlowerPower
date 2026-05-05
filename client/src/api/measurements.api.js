import client from './client';

// měření jsou přes plantId, ne gatewayId
export const getMeasurements = (plantId, params = {}) =>
  client.get('/measurements', { params: { plantId, ...params } }).then((r) => r.data);