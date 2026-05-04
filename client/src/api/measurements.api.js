import client from './client';

export const getMeasurements = (deviceId, params = {}) =>
  client.get('/measurements', { params: { deviceId, ...params } }).then((r) => r.data);