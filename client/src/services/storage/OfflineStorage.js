class OfflineStorage {
  constructor() {
    this.dbName = 'offlineStorage';
    this.dbVersion = 1;
    this.storeName = 'requests';
    this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  async saveQueue(queue) {
    const store = this.getStore('readwrite');
    await store.clear();
    return Promise.all(queue.map(item => store.add(item)));
  }

  async loadQueue() {
    const store = this.getStore('readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  getStore(mode) {
    const transaction = this.db.transaction(this.storeName, mode);
    return transaction.objectStore(this.storeName);
  }
}

export const offlineStorage = new OfflineStorage(); 