import { offlineStorage } from '../storage/OfflineStorage';

class RequestQueueManager {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.offlineStorage = offlineStorage;
  }

  async addToQueue(request) {
    const queueItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      request,
      retries: 0,
      status: 'pending',
      timestamp: Date.now()
    };

    this.queue.push(queueItem);
    await this.offlineStorage.saveQueue(this.queue);

    if (!this.isProcessing) {
      this.processQueue();
    }

    return queueItem.id;
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];

      if (!navigator.onLine) {
        await this.pauseQueue();
        break;
      }

      try {
        const response = await this.executeRequest(item);
        await this.handleSuccess(item, response);
      } catch (error) {
        const shouldRetry = await this.handleError(item, error);
        if (!shouldRetry) break;
      }
    }

    this.isProcessing = false;
    await this.offlineStorage.saveQueue(this.queue);
  }

  async executeRequest(item) {
    const { request } = item;
    return await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      ...request.options
    });
  }

  async handleSuccess(item, response) {
    if (item.onSuccess) {
      await item.onSuccess(response);
    }
    this.queue.shift();
    this.emit('requestComplete', { item, response });
  }

  async handleError(item, error) {
    if (item.retries < this.maxRetries) {
      item.retries++;
      item.status = 'retrying';
      await new Promise(resolve => setTimeout(resolve, this.retryDelay * item.retries));
      return true;
    }

    if (item.onError) {
      await item.onError(error);
    }
    
    this.queue.shift();
    this.emit('requestFailed', { item, error });
    return false;
  }

  async pauseQueue() {
    this.isProcessing = false;
    await this.offlineStorage.saveQueue(this.queue);
    this.emit('queuePaused', { queueLength: this.queue.length });
  }

  async resumeQueue() {
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  getQueueStatus() {
    return {
      length: this.queue.length,
      isProcessing: this.isProcessing,
      items: this.queue.map(item => ({
        id: item.id,
        status: item.status,
        retries: item.retries,
        timestamp: item.timestamp
      }))
    };
  }

  // Event handling
  listeners = new Map();

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }
}

export const requestQueue = new RequestQueueManager(); 