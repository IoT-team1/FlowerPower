class SseService {
  constructor() {
    this.es = null;
    this.listeners = new Map();
  }

  connect(url = `${import.meta.env.VITE_API_URL}/sse/stream`) {
    if (this.es) return;
    
    console.log('Connecting to PRODUCTION SSE at:', url);
    this.es = new EventSource(url);

    this.es.onopen = () => {
      console.log('SSE connection to Render established.');
    };

    this.es.onerror = (err) => {
      console.warn('SSE connection lost, reconnecting...', err);
    };

    // Naslouchání na události 'alert' (včetně doporučení) a 'alertResolved'
    ['alert', 'alertResolved'].forEach((event) => {
      this.es.addEventListener(event, (e) => {
        try {
          const data = JSON.parse(e.data);
          this.listeners.get(event)?.forEach((cb) => cb(data));
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      });
    });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event).delete(callback); 
  }

  disconnect() {
    if (this.es) {
      this.es.close();
      this.es = null;
      console.log('SSE connection closed.');
    }
  }
}

export default new SseService();