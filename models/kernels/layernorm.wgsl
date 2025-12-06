// ⚡ Layer Normalization Kernel
// RMSNorm variant for LLaMA-style models

struct Params {
  hidden_size: u32,
  eps: f32,
  pad1: f32,
  pad2: f32,
}

@group(0) @binding(0) var<storage, read> input: array<f32>;
@group(0) @binding(1) var<storage, read> gamma: array<f32>;
@group(0) @binding(2) var<storage, read> beta: array<f32>;
@group(0) @binding(3) var<storage, read_write> output: array<f32>;
@group(0) @binding(4) var<uniform> params: Params;

var<workgroup> shared_mean: f32;
var<workgroup> shared_var: f32;

// Standard Layer Normalization
// y = gamma * (x - mean) / sqrt(var + eps) + beta
@compute @workgroup_size(256)
fn layer_norm(
  @builtin(global_invocation_id) gid: vec3<u32>,
  @builtin(local_invocation_id) lid: vec3<u32>
) {
  let i = gid.x;
  let n = params.hidden_size;

  if (i >= n) { return; }

  // Compute mean (single thread for correctness)
  if (lid.x == 0u) {
    shared_mean = 0.0;
    for (var j = 0u; j < n; j++) {
      shared_mean += input[j];
    }
    shared_mean /= f32(n);
  }
  workgroupBarrier();

  // Compute variance
  if (lid.x == 0u) {
    shared_var = 0.0;
    for (var j = 0u; j < n; j++) {
      let diff = input[j] - shared_mean;
      shared_var += diff * diff;
    }
    shared_var /= f32(n);
  }
  workgroupBarrier();

  // Normalize
  let std = sqrt(shared_var + params.eps);
  output[i] = gamma[i] * (input[i] - shared_mean) / std + beta[i];
}

// RMS Layer Normalization (LLaMA style)
// y = gamma * x / sqrt(mean(x²) + eps)
var<workgroup> shared_rms: f32;

@compute @workgroup_size(256)
fn rms_norm(
  @builtin(global_invocation_id) gid: vec3<u32>,
  @builtin(local_invocation_id) lid: vec3<u32>
) {
  let i = gid.x;
  let n = params.hidden_size;

  if (i >= n) { return; }

  // Compute mean of squares
  if (lid.x == 0u) {
    shared_rms = 0.0;
    for (var j = 0u; j < n; j++) {
      shared_rms += input[j] * input[j];
    }
    shared_rms = sqrt(shared_rms / f32(n) + params.eps);
  }
  workgroupBarrier();

  // Normalize
  output[i] = gamma[i] * input[i] / shared_rms;
}

// Fused LayerNorm + GELU for efficiency
@compute @workgroup_size(256)
fn layer_norm_gelu(
  @builtin(global_invocation_id) gid: vec3<u32>,
  @builtin(local_invocation_id) lid: vec3<u32>
) {
  let i = gid.x;
  let n = params.hidden_size;

  if (i >= n) { return; }

  // LayerNorm
  if (lid.x == 0u) {
    shared_mean = 0.0;
    for (var j = 0u; j < n; j++) {
      shared_mean += input[j];
    }
    shared_mean /= f32(n);

    shared_var = 0.0;
    for (var j = 0u; j < n; j++) {
      let diff = input[j] - shared_mean;
      shared_var += diff * diff;
    }
    shared_var /= f32(n);
  }
  workgroupBarrier();

  // Normalize
  let std = sqrt(shared_var + params.eps);
  let normed = gamma[i] * (input[i] - shared_mean) / std + beta[i];

  // GELU
  let x = normed;
  let inner = 0.7978845608 * (x + 0.044715 * x * x * x);
  output[i] = 0.5 * x * (1.0 + tanh(inner));
}

// Parallel reduction for better performance on large hidden sizes
var<workgroup> partial_sum: array<f32, 256>;
var<workgroup> partial_sq_sum: array<f32, 256>;

@compute @workgroup_size(256)
fn layer_norm_parallel(
  @builtin(global_invocation_id) gid: vec3<u32>,
  @builtin(local_invocation_id) lid: vec3<u32>,
  @builtin(num_workgroups) nwg: vec3<u32>
) {
  let i = gid.x;
  let local_id = lid.x;
  let n = params.hidden_size;

  // Each thread accumulates partial sums
  var local_sum = 0.0;
  var local_sq_sum = 0.0;

  var idx = local_id;
  while (idx < n) {
    let val = input[idx];
    local_sum += val;
    local_sq_sum += val * val;
    idx += 256u;
  }

  partial_sum[local_id] = local_sum;
  partial_sq_sum[local_id] = local_sq_sum;
  workgroupBarrier();

  // Parallel reduction
  for (var stride = 128u; stride > 0u; stride >>= 1u) {
    if (local_id < stride) {
      partial_sum[local_id] += partial_sum[local_id + stride];
      partial_sq_sum[local_id] += partial_sq_sum[local_id + stride];
    }
    workgroupBarrier();
  }

  // Compute statistics
  let mean = partial_sum[0] / f32(n);
  let variance = partial_sq_sum[0] / f32(n) - mean * mean;
  let std = sqrt(variance + params.eps);

  // Normalize
  if (i < n) {
    output[i] = gamma[i] * (input[i] - mean) / std + beta[i];
  }
}
