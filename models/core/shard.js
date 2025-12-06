// 📊 ShardArray - Model Weight Sharding for Git LFS
// Split large models into 50MB chunks for GitHub hosting

export class ShardArray {
  constructor(baseUrl, options = {}) {
    this.base = baseUrl.replace(/\/$/, '');
    this.shardSize = options.shardSize || 50 * 1024 * 1024; // 50MB default
    this.cache = new Map();
    this.loading = new Map(); // Track in-flight requests
    this.db = null; // IndexedDB for persistence
    this.dbName = options.dbName || 'konomi-models';
  }

  // Initialize IndexedDB for persistent caching
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('shards')) {
          db.createObjectStore('shards', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      };
    });
  }

  // Get shard from IndexedDB
  async getFromDB(shardId) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('shards', 'readonly');
      const store = tx.objectStore('shards');
      const request = store.get(shardId);
      request.onsuccess = () => resolve(request.result?.data);
      request.onerror = () => reject(request.error);
    });
  }

  // Store shard in IndexedDB
  async putToDB(shardId, data) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('shards', 'readwrite');
      const store = tx.objectStore('shards');
      const request = store.put({ id: shardId, data, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Load single shard
  async load(shardIndex) {
    const key = `shard_${String(shardIndex).padStart(3, '0')}`;

    // Check memory cache
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Check if already loading
    if (this.loading.has(key)) {
      return this.loading.get(key);
    }

    // Check IndexedDB
    const cached = await this.getFromDB(key);
    if (cached) {
      const data = new Float32Array(cached);
      this.cache.set(key, data);
      return data;
    }

    // Fetch from network
    const promise = this.fetchShard(key);
    this.loading.set(key, promise);

    try {
      const data = await promise;
      this.cache.set(key, data);
      await this.putToDB(key, data.buffer);
      return data;
    } finally {
      this.loading.delete(key);
    }
  }

  // Fetch shard from URL
  async fetchShard(key) {
    const url = `${this.base}/${key}.bin`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load shard: ${url} (${response.status})`);
    }

    const buffer = await response.arrayBuffer();
    return new Float32Array(buffer);
  }

  // Load range of shards covering byte offset
  async loadRange(startByte, endByte) {
    const startShard = Math.floor(startByte / this.shardSize);
    const endShard = Math.floor(endByte / this.shardSize);

    const shards = [];
    for (let i = startShard; i <= endShard; i++) {
      shards.push(await this.load(i));
    }

    // Concatenate and slice to exact range
    const totalFloats = shards.reduce((sum, s) => sum + s.length, 0);
    const combined = new Float32Array(totalFloats);
    let offset = 0;
    for (const shard of shards) {
      combined.set(shard, offset);
      offset += shard.length;
    }

    const startOffset = (startByte % this.shardSize) / 4;
    const length = (endByte - startByte) / 4;
    return combined.slice(startOffset, startOffset + length);
  }

  // Preload multiple shards in parallel
  async preload(shardIndices) {
    return Promise.all(shardIndices.map(i => this.load(i)));
  }

  // Get cache stats
  stats() {
    let totalSize = 0;
    for (const shard of this.cache.values()) {
      totalSize += shard.byteLength;
    }
    return {
      shards: this.cache.size,
      bytes: totalSize,
      mb: (totalSize / 1024 / 1024).toFixed(2)
    };
  }

  // Clear memory cache
  clearMemory() {
    this.cache.clear();
  }

  // Clear all caches including IndexedDB
  async clearAll() {
    this.cache.clear();
    if (this.db) {
      const tx = this.db.transaction('shards', 'readwrite');
      await tx.objectStore('shards').clear();
    }
  }
}

// 🗂️ WeightVault - Manages model weight layout
export class WeightVault {
  constructor(shards, layout) {
    this.shards = shards;
    this.layout = layout; // { layerName: { offset, size, shape } }
  }

  static async fromConfig(baseUrl, configUrl) {
    const config = await fetch(configUrl).then(r => r.json());
    const shards = new ShardArray(baseUrl, { shardSize: config.shardSize });
    return new WeightVault(shards, config.layout);
  }

  // Get weights for a specific layer
  async getWeights(layerName) {
    const info = this.layout[layerName];
    if (!info) throw new Error(`Unknown layer: ${layerName}`);

    const data = await this.shards.loadRange(info.offset, info.offset + info.size);
    return {
      data,
      shape: info.shape,
      dtype: info.dtype || 'float32'
    };
  }

  // Get all weights for a transformer block
  async getBlock(blockIndex) {
    const prefix = `layers.${blockIndex}`;
    const weights = {};

    for (const [name, info] of Object.entries(this.layout)) {
      if (name.startsWith(prefix)) {
        const shortName = name.slice(prefix.length + 1);
        weights[shortName] = await this.getWeights(name);
      }
    }

    return weights;
  }

  // Preload weights for upcoming layers
  async preloadBlocks(startBlock, count = 2) {
    const shardSet = new Set();

    for (let i = startBlock; i < startBlock + count; i++) {
      const prefix = `layers.${i}`;
      for (const [name, info] of Object.entries(this.layout)) {
        if (name.startsWith(prefix)) {
          const startShard = Math.floor(info.offset / this.shards.shardSize);
          const endShard = Math.floor((info.offset + info.size) / this.shards.shardSize);
          for (let s = startShard; s <= endShard; s++) {
            shardSet.add(s);
          }
        }
      }
    }

    await this.shards.preload([...shardSet]);
  }
}

export default ShardArray;
