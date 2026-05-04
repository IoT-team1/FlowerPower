import client from './client';

export const getDevices = () =>
  client.get('/gateways').then((r) => r.data);

export const getDevice = (id) =>
  client.get(`gateways/${id}`).then((r) => r.data);