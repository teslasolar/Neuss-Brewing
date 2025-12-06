// 🧬 Konomi WebGPU Model System - Main Index
// Export all core components

export { GPUCore, getGPU } from './gpu.js';
export { TensorCube } from './tensor.js';
export { ShardArray, WeightVault } from './shard.js';
export { ModelCore } from './model.js';
export { Pipeline, StreamBuffer, BatchPipeline } from './pipeline.js';
export { Tokenizer, CharTokenizer } from './tokenizer.js';

// Quick setup helper
export async function createInferencePipeline(modelUrl) {
  const { Pipeline } = await import('./pipeline.js');
  return Pipeline.create(modelUrl);
}

// Version info
export const VERSION = '1.0.0';
export const KONOMI_SPEC = {
  name: 'Konomi WebGPU Model System',
  architecture: '3D TensorCube + Git LFS Sharding',
  features: [
    'WebGPU Compute',
    'Model Sharding',
    'Streaming Inference',
    '3D Tensor Navigation',
    'WGSL Kernels'
  ]
};
