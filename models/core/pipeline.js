// 🌊 Pipeline - Streaming Token Generation
// Real-time inference with async iteration

import ModelCore from './model.js';
import Tokenizer from './tokenizer.js';

export class Pipeline {
  constructor(model, tokenizer) {
    this.model = model;
    this.tokenizer = tokenizer;
    this.streaming = false;
    this.aborted = false;
    this.stats = {
      tokensGenerated: 0,
      totalTime: 0,
      firstTokenTime: 0
    };
  }

  static async create(modelUrl) {
    const model = await ModelCore.create(modelUrl);
    const tokenizer = await Tokenizer.fromUrl(`${modelUrl}/tokenizer.json`);
    return new Pipeline(model, tokenizer);
  }

  // Streaming generator
  async *generate(prompt, options = {}) {
    const {
      maxTokens = 100,
      temperature = 0.8,
      topK = 40,
      topP = 0.9,
      stopTokens = [],
      onToken = null
    } = options;

    this.streaming = true;
    this.aborted = false;
    this.stats = { tokensGenerated: 0, totalTime: 0, firstTokenTime: 0 };

    const startTime = performance.now();
    let tokens = this.tokenizer.encode(prompt);
    this.model.currentSeqLen = tokens.length;

    for (let i = 0; i < maxTokens && this.streaming && !this.aborted; i++) {
      // Forward pass
      const logits = await this.model.forward(tokens);
      const lastLogits = await this.model.getLastLogits(logits);

      // Sample next token
      const nextToken = this.model.sample(lastLogits, temperature, topK);

      // Check stop conditions
      if (stopTokens.includes(nextToken) || nextToken === this.tokenizer.eosId) {
        break;
      }

      // Update tokens
      tokens.push(nextToken);
      this.model.currentSeqLen = tokens.length;

      // Decode and yield
      const text = this.tokenizer.decode([nextToken]);

      // Update stats
      this.stats.tokensGenerated++;
      const now = performance.now();
      this.stats.totalTime = now - startTime;
      if (i === 0) this.stats.firstTokenTime = this.stats.totalTime;

      // Callback if provided
      if (onToken) onToken(text, this.stats);

      yield text;
    }

    this.streaming = false;
  }

  // Non-streaming generation
  async complete(prompt, options = {}) {
    const tokens = [];
    for await (const token of this.generate(prompt, options)) {
      tokens.push(token);
    }
    return tokens.join('');
  }

  // Stop generation
  stop() {
    this.aborted = true;
    this.streaming = false;
  }

  // Get current stats
  getStats() {
    return {
      ...this.stats,
      tokensPerSecond: this.stats.tokensGenerated / (this.stats.totalTime / 1000),
      latency: this.stats.firstTokenTime
    };
  }

  // Chat-style interface
  async *chat(messages, options = {}) {
    // Format messages into prompt
    const prompt = this.formatChat(messages);
    yield* this.generate(prompt, {
      ...options,
      stopTokens: [...(options.stopTokens || []), this.tokenizer.encode('\n\nUser:')[0]]
    });
  }

  formatChat(messages) {
    return messages.map(m => {
      const role = m.role === 'user' ? 'User' : 'Assistant';
      return `${role}: ${m.content}`;
    }).join('\n\n') + '\n\nAssistant:';
  }
}

// 📡 StreamBuffer - Manages streaming output
export class StreamBuffer {
  constructor() {
    this.buffer = '';
    this.chunks = [];
    this.listeners = new Set();
  }

  push(text) {
    this.buffer += text;
    this.chunks.push({ text, timestamp: Date.now() });
    for (const listener of this.listeners) {
      listener(text, this.buffer);
    }
  }

  onChunk(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  clear() {
    this.buffer = '';
    this.chunks = [];
  }

  getText() {
    return this.buffer;
  }
}

// 🔄 BatchPipeline - Process multiple prompts
export class BatchPipeline {
  constructor(pipeline, batchSize = 4) {
    this.pipeline = pipeline;
    this.batchSize = batchSize;
    this.queue = [];
    this.processing = false;
  }

  async add(prompt, options = {}) {
    return new Promise((resolve, reject) => {
      this.queue.push({ prompt, options, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);

      // Process batch in parallel (simplified - real impl would batch at GPU level)
      await Promise.all(batch.map(async ({ prompt, options, resolve, reject }) => {
        try {
          const result = await this.pipeline.complete(prompt, options);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }));
    }

    this.processing = false;
  }
}

export default Pipeline;
