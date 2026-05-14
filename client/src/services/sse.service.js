class SseService {
  constructor() {
    this.es = null;
    this.listeners = new Map();
  }

  connect(url = `${import.meta.env.VITE_API_URL}/sse/stream`) {
    if (this.es) return;
    this.es = new EventSource(url);

    this.es.onerror = () => {
      console.warn('SSE connection lost, reconnecting...');
    };

    // Sends alerts to registered listeners
    ['alert', 'alertResolved'].forEach((event) => {
      this.es.addEventListener(event, (e) => {
        const data = JSON.parse(e.data);
        this.listeners.get(event)?.forEach((cb) => cb(data));
      });
    });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event).delete(callback); // vrátí cleanup
  }

  disconnect() {
    this.es?.close();
    this.es = null;
  }
}

export default new SseService();