// 🎯 ModelCore - Universal Model Runner (ONNX/Custom)
// Konomi FemtoLLM Integration

import { getGPU } from './gpu.js';
import TensorCube from './tensor.js';
import { WeightVault } from './shard.js';

export class ModelCore {
  constructor(gpu, config = {}) {
    this.gpu = gpu;
    this.config = config;
    this.tensor = null;
    this.vault = null;
    this.layers = [];
    this.embeddings = null;
    this.lmHead = null;
    this.ready = false;
  }

  static async create(modelUrl) {
    const gpu = await getGPU();
    const model = new ModelCore(gpu);
    await model.load(modelUrl);
    return model;
  }

  // Load model from URL
  async load(baseUrl) {
    // Load config
    const configUrl = `${baseUrl}/config.json`;
    const config = await fetch(configUrl).then(r => r.json());
    this.config = config;

    // Initialize tensor cube
    this.tensor = await TensorCube.create([
      config.numLayers || 12,
      config.numHeads || 12,
      config.hiddenSize || 768
    ]);

    // Load weight vault
    this.vault = await WeightVault.fromConfig(baseUrl, `${baseUrl}/layout.json`);

    // Build computation graph
    await this.buildGraph();

    this.ready = true;
    return this;
  }

  // Build transformer computation graph
  async buildGraph() {
    const { numLayers, hiddenSize, numHeads, vocabSize } = this.config;
    const headDim = hiddenSize / numHeads;

    // Load embeddings
    this.embeddings = await this.vault.getWeights('embeddings.weight');

    // Build layers
    for (let i = 0; i < numLayers; i++) {
      this.layers.push({
        index: i,
        attn: {
          qkv: `layers.${i}.attn.qkv`,
          out: `layers.${i}.attn.out`
        },
        ffn: {
          up: `layers.${i}.ffn.up`,
          down: `layers.${i}.ffn.down`
        },
        norm1: `layers.${i}.norm1`,
        norm2: `layers.${i}.norm2`
      });
    }

    // LM head
    this.lmHead = await this.vault.getWeights('lm_head.weight');
  }

  // Forward pass through transformer
  async forward(inputIds) {
    let hidden = await this.embed(inputIds);

    // Preload next few layers
    this.vault.preloadBlocks(0, 3);

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];

      // Preload upcoming weights
      if (i + 2 < this.layers.length) {
        this.vault.preloadBlocks(i + 2, 2);
      }

      // Self attention
      const normed1 = await this.layerNorm(hidden, layer.norm1);
      const attnOut = await this.attention(normed1, layer.attn, i);
      hidden = await this.add(hidden, attnOut);

      // FFN
      const normed2 = await this.layerNorm(hidden, layer.norm2);
      const ffnOut = await this.ffn(normed2, layer.ffn);
      hidden = await this.add(hidden, ffnOut);
    }

    // Final layer norm
    hidden = await this.layerNorm(hidden, 'final_norm');

    // LM head projection
    const logits = await this.project(hidden, this.lmHead);

    return logits;
  }

  // Embedding lookup
  async embed(inputIds) {
    const seqLen = inputIds.length;
    const hiddenSize = this.config.hiddenSize;
    const output = new Float32Array(seqLen * hiddenSize);

    for (let i = 0; i < seqLen; i++) {
      const tokenId = inputIds[i];
      const start = tokenId * hiddenSize;
      output.set(
        this.embeddings.data.slice(start, start + hiddenSize),
        i * hiddenSize
      );
    }

    return this.gpu.buffer(output);
  }

  // Multi-head self attention
  async attention(input, attnConfig, layerIdx) {
    const weights = await this.vault.getWeights(attnConfig.qkv);
    const outWeights = await this.vault.getWeights(attnConfig.out);

    const { hiddenSize, numHeads } = this.config;
    const headDim = hiddenSize / numHeads;
    const seqLen = this.currentSeqLen;

    // Project to Q, K, V
    const qkvBuf = this.gpu.buffer(weights.data);
    const qkv = await this.tensor.matmul(input, qkvBuf, seqLen, hiddenSize, hiddenSize * 3);

    // Split and compute attention (simplified - full impl would be more complex)
    // For now, use the attention kernel
    const outBuf = this.gpu.empty(seqLen * hiddenSize * 4);

    // Project output
    const outProjBuf = this.gpu.buffer(outWeights.data);
    return await this.tensor.matmul(outBuf, outProjBuf, seqLen, hiddenSize, hiddenSize);
  }

  // Layer normalization
  async layerNorm(input, normName) {
    const weights = await this.vault.getWeights(normName + '.weight');
    const bias = await this.vault.getWeights(normName + '.bias');

    const gammaBuf = this.gpu.buffer(weights.data);
    const betaBuf = this.gpu.buffer(bias.data);

    return await this.tensor.layernorm(input, gammaBuf, betaBuf, this.config.hiddenSize);
  }

  // Feed-forward network
  async ffn(input, ffnConfig) {
    const upWeights = await this.vault.getWeights(ffnConfig.up);
    const downWeights = await this.vault.getWeights(ffnConfig.down);

    const { hiddenSize, intermediateSize } = this.config;
    const seqLen = this.currentSeqLen;

    // Up projection
    const upBuf = this.gpu.buffer(upWeights.data);
    let hidden = await this.tensor.matmul(input, upBuf, seqLen, hiddenSize, intermediateSize);

    // GELU activation
    hidden = await this.tensor.gelu(hidden, seqLen * intermediateSize);

    // Down projection
    const downBuf = this.gpu.buffer(downWeights.data);
    return await this.tensor.matmul(hidden, downBuf, seqLen, intermediateSize, hiddenSize);
  }

  // Element-wise add
  async add(a, b) {
    const kernel = this.tensor.kernels.get('add');
    const size = this.currentSeqLen * this.config.hiddenSize;
    const output = this.gpu.empty(size * 4);
    const bind = this.gpu.bind(kernel, [a, b, output]);
    await this.gpu.dispatch(kernel, bind, Math.ceil(size / 256));
    return output;
  }

  // Project to vocabulary
  async project(hidden, lmHead) {
    const seqLen = this.currentSeqLen;
    const hiddenSize = this.config.hiddenSize;
    const vocabSize = this.config.vocabSize;

    const headBuf = this.gpu.buffer(lmHead.data);
    return await this.tensor.matmul(hidden, headBuf, seqLen, hiddenSize, vocabSize);
  }

  // Get logits for last token
  async getLastLogits(logitsBuf) {
    const vocabSize = this.config.vocabSize;
    const seqLen = this.currentSeqLen;

    // Read last token's logits
    const allLogits = await this.gpu.read(logitsBuf, seqLen * vocabSize * 4);
    return allLogits.slice((seqLen - 1) * vocabSize, seqLen * vocabSize);
  }

  // Sample next token
  sample(logits, temperature = 0.8, topK = 40) {
    // Apply temperature
    const scaled = logits.map(l => l / temperature);

    // Top-k filtering
    const indexed = Array.from(scaled).map((v, i) => ({ v, i }));
    indexed.sort((a, b) => b.v - a.v);
    const topKItems = indexed.slice(0, topK);

    // Softmax
    const maxVal = topKItems[0].v;
    const exps = topKItems.map(x => ({ ...x, exp: Math.exp(x.v - maxVal) }));
    const sumExp = exps.reduce((s, x) => s + x.exp, 0);
    const probs = exps.map(x => ({ ...x, p: x.exp / sumExp }));

    // Multinomial sampling
    const r = Math.random();
    let cumProb = 0;
    for (const item of probs) {
      cumProb += item.p;
      if (r < cumProb) {
        return item.i;
      }
    }
    return probs[0].i;
  }

  // Get model info
  info() {
    return {
      layers: this.config.numLayers,
      heads: this.config.numHeads,
      hidden: this.config.hiddenSize,
      vocab: this.config.vocabSize,
      params: this.estimateParams()
    };
  }

  estimateParams() {
    const { numLayers, hiddenSize, intermediateSize, vocabSize } = this.config;
    const attn = hiddenSize * hiddenSize * 4; // QKV + out
    const ffn = hiddenSize * intermediateSize * 2;
    const perLayer = attn + ffn + hiddenSize * 4; // + norms
    const embed = vocabSize * hiddenSize * 2; // + lm_head
    return numLayers * perLayer + embed;
  }
}

export default ModelCore;
