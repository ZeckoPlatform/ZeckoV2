class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
    this.maxSize = 100; // Maximum number of cached items
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  }

  set(key, value, ttl = this.defaultTTL) {
    // Ensure cache doesn't exceed max size
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.delete(oldestKey);
    }

    const expiryTime = Date.now() + ttl;
    this.cache.set(key, value);
    this.ttls.set(key, expiryTime);

    // Schedule cleanup
    setTimeout(() => this.delete(key), ttl);
  }

  get(key) {
    if (!this.has(key)) return null;

    const value = this.cache.get(key);
    const ttl = this.ttls.get(key);

    if (Date.now() > ttl) {
      this.delete(key);
      return null;
    }

    return value;
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    this.cache.delete(key);
    this.ttls.delete(key);
  }

  clear() {
    this.cache.clear();
    this.ttls.clear();
  }

  getCacheKey(config) {
    const { url, method, params, data } = config;
    return JSON.stringify({
      url,
      method: method.toLowerCase(),
      params,
      data,
    });
  }
}

export const cacheService = new CacheService(); 