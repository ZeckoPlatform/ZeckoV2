class RetryService {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 1000; // Base delay in milliseconds
    this.maxDelay = 10000; // Maximum delay in milliseconds
    this.retryableStatuses = [408, 429, 500, 502, 503, 504];
  }

  shouldRetry(error, retryCount) {
    if (retryCount >= this.maxRetries) return false;
    
    // Don't retry client errors except timeout and rate limiting
    if (error.response?.status && !this.retryableStatuses.includes(error.response.status)) {
      return false;
    }

    return true;
  }

  getDelay(retryCount) {
    // Exponential backoff with jitter
    const exponentialDelay = Math.min(
      this.maxDelay,
      this.retryDelay * Math.pow(2, retryCount)
    );
    
    // Add random jitter ±25%
    const jitter = exponentialDelay * 0.25 * (Math.random() - 0.5);
    
    return exponentialDelay + jitter;
  }

  async retryRequest(requestFn, context = {}) {
    let retryCount = 0;
    
    while (true) {
      try {
        return await requestFn();
      } catch (error) {
        if (!this.shouldRetry(error, retryCount)) {
          throw error;
        }

        retryCount++;
        const delay = this.getDelay(retryCount);
        
        console.log(`Retrying request (${retryCount}/${this.maxRetries}) after ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

export const retryService = new RetryService(); 