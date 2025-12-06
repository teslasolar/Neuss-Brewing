// ⚡ Activation Function Kernels
// GELU, ReLU, SiLU, Softmax

@group(0) @binding(0) var<storage, read> input: array<f32>;
@group(0) @binding(1) var<storage, read_write> output: array<f32>;

// Constants
const SQRT_2_PI: f32 = 0.7978845608028654;
const GELU_COEFF: f32 = 0.044715;

// GELU activation (exact)
// gelu(x) = x * Φ(x) where Φ is the CDF of standard normal
@compute @workgroup_size(256)
fn gelu(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= arrayLength(&input)) { return; }

  let x = input[i];
  // Approximation: 0.5 * x * (1 + tanh(sqrt(2/π) * (x + 0.044715 * x³)))
  let inner = SQRT_2_PI * (x + GELU_COEFF * x * x * x);
  output[i] = 0.5 * x * (1.0 + tanh(inner));
}

// Fast GELU approximation
@compute @workgroup_size(256)
fn gelu_fast(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= arrayLength(&input)) { return; }

  let x = input[i];
  // Sigmoid approximation: x * sigmoid(1.702 * x)
  output[i] = x / (1.0 + exp(-1.702 * x));
}

// ReLU activation
@compute @workgroup_size(256)
fn relu(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= arrayLength(&input)) { return; }

  output[i] = max(0.0, input[i]);
}

// Leaky ReLU
@compute @workgroup_size(256)
fn leaky_relu(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= arrayLength(&input)) { return; }

  let x = input[i];
  output[i] = select(0.01 * x, x, x > 0.0);
}

// SiLU (Swish) activation: x * sigmoid(x)
@compute @workgroup_size(256)
fn silu(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= arrayLength(&input)) { return; }

  let x = input[i];
  output[i] = x / (1.0 + exp(-x));
}

// Sigmoid activation
@compute @workgroup_size(256)
fn sigmoid(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= arrayLength(&input)) { return; }

  output[i] = 1.0 / (1.0 + exp(-input[i]));
}

// Tanh activation
@compute @workgroup_size(256)
fn tanh_act(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= arrayLength(&input)) { return; }

  output[i] = tanh(input[i]);
}

// Softmax (requires reduction)
// Note: This is a simplified per-element version
// Full softmax needs multiple passes
var<workgroup> shared_max: f32;
var<workgroup> shared_sum: f32;

@compute @workgroup_size(256)
fn softmax(
  @builtin(global_invocation_id) gid: vec3<u32>,
  @builtin(local_invocation_id) lid: vec3<u32>
) {
  let i = gid.x;
  let n = arrayLength(&input);

  if (i >= n) { return; }

  // Pass 1: Find max (single thread for simplicity)
  if (lid.x == 0u) {
    shared_max = input[0];
    for (var j = 1u; j < n; j++) {
      shared_max = max(shared_max, input[j]);
    }
  }
  workgroupBarrier();

  // Pass 2: Compute exp and sum
  let exp_val = exp(input[i] - shared_max);

  if (lid.x == 0u) {
    shared_sum = 0.0;
    for (var j = 0u; j < n; j++) {
      shared_sum += exp(input[j] - shared_max);
    }
  }
  workgroupBarrier();

  // Pass 3: Normalize
  output[i] = exp_val / shared_sum;
}

// Log softmax for numerical stability
@compute @workgroup_size(256)
fn log_softmax(
  @builtin(global_invocation_id) gid: vec3<u32>,
  @builtin(local_invocation_id) lid: vec3<u32>
) {
  let i = gid.x;
  let n = arrayLength(&input);

  if (i >= n) { return; }

  // Find max
  if (lid.x == 0u) {
    shared_max = input[0];
    for (var j = 1u; j < n; j++) {
      shared_max = max(shared_max, input[j]);
    }
  }
  workgroupBarrier();

  // Compute log sum exp
  if (lid.x == 0u) {
    shared_sum = 0.0;
    for (var j = 0u; j < n; j++) {
      shared_sum += exp(input[j] - shared_max);
    }
    shared_sum = log(shared_sum);
  }
  workgroupBarrier();

  // log_softmax = x - max - log_sum_exp
  output[i] = input[i] - shared_max - shared_sum;
}
