// ⚡ GPUCore - WebGPU Direct Browser Access
// Konomi 3D Database Architecture - GPU Compute Layer

export class GPUCore {
  constructor() {
    this.gpu = null;
    this.device = null;
    this.q = null;
    this.ready = false;
    this.limits = {};
  }

  async init() {
    if (!navigator.gpu) {
      throw new Error('WebGPU not supported - use Chrome 113+ or Edge 113+');
    }

    this.gpu = await navigator.gpu.requestAdapter({
      powerPreference: 'high-performance'
    });

    if (!this.gpu) {
      throw new Error('No GPU adapter found');
    }

    this.device = await this.gpu.requestDevice({
      requiredLimits: {
        maxBufferSize: 1024 * 1024 * 1024, // 1GB
        maxStorageBufferBindingSize: 1024 * 1024 * 1024,
        maxComputeWorkgroupsPerDimension: 65535
      }
    });

    this.q = this.device.queue;
    this.limits = {
      maxBuffer: this.device.limits.maxBufferSize,
      maxCompute: this.device.limits.maxComputeWorkgroupsPerDimension,
      maxBindGroups: this.device.limits.maxBindGroups
    };

    this.ready = true;
    return this;
  }

  // Create compute shader module
  shader(code) {
    return this.device.createShaderModule({ code });
  }

  // Create compute pipeline from WGSL
  kernel(wgsl, entryPoint = 'main') {
    const module = this.shader(wgsl);
    return this.device.createComputePipeline({
      layout: 'auto',
      compute: { module, entryPoint }
    });
  }

  // Create GPU buffer
  buffer(data, usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST) {
    const buf = this.device.createBuffer({
      size: data.byteLength,
      usage,
      mappedAtCreation: true
    });
    new Float32Array(buf.getMappedRange()).set(data);
    buf.unmap();
    return buf;
  }

  // Create empty buffer
  empty(size, usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST) {
    return this.device.createBuffer({ size, usage });
  }

  // Create bind group for kernel
  bind(pipeline, buffers) {
    const entries = buffers.map((buf, i) => ({
      binding: i,
      resource: { buffer: buf }
    }));
    return this.device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries
    });
  }

  // Execute compute kernel
  async dispatch(pipeline, bindGroup, x, y = 1, z = 1) {
    const cmd = this.device.createCommandEncoder();
    const pass = cmd.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(x, y, z);
    pass.end();
    this.q.submit([cmd.finish()]);
    await this.device.queue.onSubmittedWorkDone();
  }

  // Read buffer back to CPU
  async read(buffer, size) {
    const staging = this.device.createBuffer({
      size,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });

    const cmd = this.device.createCommandEncoder();
    cmd.copyBufferToBuffer(buffer, 0, staging, 0, size);
    this.q.submit([cmd.finish()]);

    await staging.mapAsync(GPUMapMode.READ);
    const data = new Float32Array(staging.getMappedRange().slice(0));
    staging.unmap();
    staging.destroy();
    return data;
  }

  // Get GPU info
  info() {
    return {
      name: this.gpu.name || 'Unknown GPU',
      limits: this.limits,
      features: [...this.gpu.features].join(', ')
    };
  }

  destroy() {
    this.device?.destroy();
    this.ready = false;
  }
}

// Singleton instance
let _gpu = null;
export async function getGPU() {
  if (!_gpu) {
    _gpu = new GPUCore();
    await _gpu.init();
  }
  return _gpu;
}

export default GPUCore;
