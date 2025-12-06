// 🧊 TensorCube - 3D Tensor Operations on GPU
// Konomi BlockArray Integration

import { getGPU } from './gpu.js';

export class TensorCube {
  constructor(gpu, dims = [256, 256, 256]) {
    this.gpu = gpu;
    this.dims = dims;
    this.buffers = new Map(); // coord key → GPU buffer
    this.kernels = new Map(); // op name → compiled pipeline
    this.cache = new Map();   // result cache
  }

  static async create(dims) {
    const gpu = await getGPU();
    const cube = new TensorCube(gpu, dims);
    await cube.compileKernels();
    return cube;
  }

  // Compile common compute kernels
  async compileKernels() {
    const ops = {
      add: this.gpu.kernel(WGSL_ADD),
      mul: this.gpu.kernel(WGSL_MUL),
      matmul: this.gpu.kernel(WGSL_MATMUL),
      softmax: this.gpu.kernel(WGSL_SOFTMAX),
      layernorm: this.gpu.kernel(WGSL_LAYERNORM),
      gelu: this.gpu.kernel(WGSL_GELU),
      attention: this.gpu.kernel(WGSL_ATTENTION)
    };
    for (const [name, kernel] of Object.entries(ops)) {
      this.kernels.set(name, kernel);
    }
  }

  // Get or create buffer at 3D coordinate
  getBuffer(x, y, z, size = 4096) {
    const key = `${x},${y},${z}`;
    if (!this.buffers.has(key)) {
      const buf = this.gpu.empty(size * 4); // float32
      this.buffers.set(key, buf);
    }
    return this.buffers.get(key);
  }

  // Store tensor at coordinate
  async store(x, y, z, data) {
    const buf = this.gpu.buffer(new Float32Array(data));
    this.buffers.set(`${x},${y},${z}`, buf);
    return buf;
  }

  // Execute operation at coordinate
  async compute(op, inputs, outputSize) {
    const kernel = this.kernels.get(op);
    if (!kernel) throw new Error(`Unknown op: ${op}`);

    const outBuf = this.gpu.empty(outputSize * 4);
    const bindGroup = this.gpu.bind(kernel, [...inputs, outBuf]);

    const workgroups = Math.ceil(outputSize / 256);
    await this.gpu.dispatch(kernel, bindGroup, workgroups);

    return outBuf;
  }

  // Matrix multiply: C = A @ B
  async matmul(a, b, M, K, N) {
    const kernel = this.kernels.get('matmul');
    const c = this.gpu.empty(M * N * 4);

    // Create uniform buffer for dimensions
    const dims = this.gpu.buffer(new Uint32Array([M, K, N, 0]));

    const bind = this.gpu.device.createBindGroup({
      layout: kernel.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: a } },
        { binding: 1, resource: { buffer: b } },
        { binding: 2, resource: { buffer: c } },
        { binding: 3, resource: { buffer: dims } }
      ]
    });

    await this.gpu.dispatch(kernel, bind, Math.ceil(M / 16), Math.ceil(N / 16));
    return c;
  }

  // Softmax along last dimension
  async softmax(input, size) {
    const kernel = this.kernels.get('softmax');
    const output = this.gpu.empty(size * 4);
    const bind = this.gpu.bind(kernel, [input, output]);
    await this.gpu.dispatch(kernel, bind, Math.ceil(size / 256));
    return output;
  }

  // Layer normalization
  async layernorm(input, gamma, beta, size) {
    const kernel = this.kernels.get('layernorm');
    const output = this.gpu.empty(size * 4);
    const bind = this.gpu.bind(kernel, [input, gamma, beta, output]);
    await this.gpu.dispatch(kernel, bind, Math.ceil(size / 256));
    return output;
  }

  // GELU activation
  async gelu(input, size) {
    const kernel = this.kernels.get('gelu');
    const output = this.gpu.empty(size * 4);
    const bind = this.gpu.bind(kernel, [input, output]);
    await this.gpu.dispatch(kernel, bind, Math.ceil(size / 256));
    return output;
  }

  // Free all buffers
  clear() {
    for (const buf of this.buffers.values()) {
      buf.destroy();
    }
    this.buffers.clear();
    this.cache.clear();
  }

  // Navigate through tensor space
  navigate(layer, head, dim) {
    return {
      layer: Math.max(0, Math.min(this.dims[0] - 1, layer)),
      head: Math.max(0, Math.min(this.dims[1] - 1, head)),
      dim: Math.max(0, Math.min(this.dims[2] - 1, dim))
    };
  }
}

// WGSL Compute Shaders
const WGSL_ADD = `
@group(0) @binding(0) var<storage,read> a: array<f32>;
@group(0) @binding(1) var<storage,read> b: array<f32>;
@group(0) @binding(2) var<storage,read_write> c: array<f32>;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let i = id.x;
  if (i < arrayLength(&a)) {
    c[i] = a[i] + b[i];
  }
}`;

const WGSL_MUL = `
@group(0) @binding(0) var<storage,read> a: array<f32>;
@group(0) @binding(1) var<storage,read> b: array<f32>;
@group(0) @binding(2) var<storage,read_write> c: array<f32>;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let i = id.x;
  if (i < arrayLength(&a)) {
    c[i] = a[i] * b[i];
  }
}`;

const WGSL_MATMUL = `
struct Dims { M: u32, K: u32, N: u32, pad: u32 }

@group(0) @binding(0) var<storage,read> a: array<f32>;
@group(0) @binding(1) var<storage,read> b: array<f32>;
@group(0) @binding(2) var<storage,read_write> c: array<f32>;
@group(0) @binding(3) var<uniform> dims: Dims;

@compute @workgroup_size(16,16)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let row = id.x;
  let col = id.y;
  if (row >= dims.M || col >= dims.N) { return; }

  var sum = 0.0;
  for (var k = 0u; k < dims.K; k++) {
    sum += a[row * dims.K + k] * b[k * dims.N + col];
  }
  c[row * dims.N + col] = sum;
}`;

const WGSL_SOFTMAX = `
@group(0) @binding(0) var<storage,read> input: array<f32>;
@group(0) @binding(1) var<storage,read_write> output: array<f32>;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let i = id.x;
  let n = arrayLength(&input);
  if (i >= n) { return; }

  // Find max for numerical stability
  var maxVal = input[0];
  for (var j = 1u; j < n; j++) {
    maxVal = max(maxVal, input[j]);
  }

  // Compute exp and sum
  var sumExp = 0.0;
  for (var j = 0u; j < n; j++) {
    sumExp += exp(input[j] - maxVal);
  }

  output[i] = exp(input[i] - maxVal) / sumExp;
}`;

const WGSL_LAYERNORM = `
@group(0) @binding(0) var<storage,read> input: array<f32>;
@group(0) @binding(1) var<storage,read> gamma: array<f32>;
@group(0) @binding(2) var<storage,read> beta: array<f32>;
@group(0) @binding(3) var<storage,read_write> output: array<f32>;

const EPS: f32 = 1e-5;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let i = id.x;
  let n = arrayLength(&input);
  if (i >= n) { return; }

  // Compute mean
  var mean = 0.0;
  for (var j = 0u; j < n; j++) {
    mean += input[j];
  }
  mean /= f32(n);

  // Compute variance
  var variance = 0.0;
  for (var j = 0u; j < n; j++) {
    let diff = input[j] - mean;
    variance += diff * diff;
  }
  variance /= f32(n);

  // Normalize
  let std = sqrt(variance + EPS);
  output[i] = gamma[i] * (input[i] - mean) / std + beta[i];
}`;

const WGSL_GELU = `
@group(0) @binding(0) var<storage,read> input: array<f32>;
@group(0) @binding(1) var<storage,read_write> output: array<f32>;

const SQRT_2_OVER_PI: f32 = 0.7978845608;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let i = id.x;
  if (i >= arrayLength(&input)) { return; }

  let x = input[i];
  // GELU approximation: 0.5 * x * (1 + tanh(sqrt(2/pi) * (x + 0.044715 * x^3)))
  let inner = SQRT_2_OVER_PI * (x + 0.044715 * x * x * x);
  output[i] = 0.5 * x * (1.0 + tanh(inner));
}`;

const WGSL_ATTENTION = `
struct Params { seqLen: u32, headDim: u32, numHeads: u32, scale: f32 }

@group(0) @binding(0) var<storage,read> q: array<f32>;
@group(0) @binding(1) var<storage,read> k: array<f32>;
@group(0) @binding(2) var<storage,read> v: array<f32>;
@group(0) @binding(3) var<storage,read_write> output: array<f32>;
@group(0) @binding(4) var<uniform> params: Params;

@compute @workgroup_size(16,16)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let seq = id.x;
  let head = id.y;
  if (seq >= params.seqLen || head >= params.numHeads) { return; }

  let headOffset = head * params.seqLen * params.headDim;

  // Compute attention scores for this position
  for (var d = 0u; d < params.headDim; d++) {
    var sum = 0.0;
    for (var s = 0u; s <= seq; s++) {
      // Q @ K^T
      var score = 0.0;
      for (var i = 0u; i < params.headDim; i++) {
        score += q[headOffset + seq * params.headDim + i] *
                 k[headOffset + s * params.headDim + i];
      }
      score *= params.scale;

      // Softmax (simplified)
      let attn = exp(score);

      // Weighted sum of V
      sum += attn * v[headOffset + s * params.headDim + d];
    }
    output[headOffset + seq * params.headDim + d] = sum;
  }
}`;

export default TensorCube;
