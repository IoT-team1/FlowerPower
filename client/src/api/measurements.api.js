import client from './client';

// Based on plantId
export const getMeasurements = (plantId, params = {}) =>
  client.get('/measurements', { params: { plantId, ...params } }).then((r) => r.data);