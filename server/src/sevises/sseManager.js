const AlertDao = require('../dao/alert-dao');

class SseManager {
  constructor() {
    this.clients = new Map();
  }

  async addClient(clientId, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const keepAlive = setInterval(() => res.write(': ping\n\n'), 30_000);
    this.clients.set(clientId, res);

    // Sending all existing alerts to the new client
    const existing = await AlertDao.list({ isResolved: false });
    existing.forEach((alert) => {
      res.write(`event: alert\ndata: ${JSON.stringify({
        _id: alert._id,
        plantId: alert.plantId,
        plantName: alert.plantId?.name ?? '',
        message: alert.message,
        level: alert.level,
        isResolved: alert.isResolved,
        timestamp: alert.timestamp,
      })}\n\n`);
    });

    res.on('close', () => {
      clearInterval(keepAlive);
      this.clients.delete(clientId);
    });
  }

  broadcast(eventName, data) {
    const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of this.clients.values()) {
      res.write(payload);
    }
  }
}

module.exports = new SseManager();