// ⚡ Multi-Head Self Attention Kernel
// Konomi WebGPU Compute Shader

struct Params {
  seqLen: u32,
  headDim: u32,
  numHeads: u32,
  scale: f32,
}

@group(0) @binding(0) var<storage, read> query: array<f32>;
@group(0) @binding(1) var<storage, read> key: array<f32>;
@group(0) @binding(2) var<storage, read> value: array<f32>;
@group(0) @binding(3) var<storage, read_write> output: array<f32>;
@group(0) @binding(4) var<uniform> params: Params;

// Shared memory for attention scores
var<workgroup> attn_scores: array<f32, 1024>;
var<workgroup> attn_max: f32;
var<workgroup> attn_sum: f32;

@compute @workgroup_size(16, 16, 1)
fn main(
  @builtin(global_invocation_id) gid: vec3<u32>,
  @builtin(local_invocation_id) lid: vec3<u32>,
  @builtin(workgroup_id) wid: vec3<u32>
) {
  let seq_pos = gid.x;
  let head_idx = gid.y;

  if (seq_pos >= params.seqLen || head_idx >= params.numHeads) {
    return;
  }

  let head_offset = head_idx * params.seqLen * params.headDim;
  let q_offset = head_offset + seq_pos * params.headDim;

  // Step 1: Compute QK^T for this position
  for (var k_pos = 0u; k_pos <= seq_pos; k_pos++) {
    let k_offset = head_offset + k_pos * params.headDim;

    var score = 0.0;
    for (var d = 0u; d < params.headDim; d++) {
      score += query[q_offset + d] * key[k_offset + d];
    }
    attn_scores[k_pos] = score * params.scale;
  }

  // Causal mask: set future positions to -inf
  for (var k_pos = seq_pos + 1u; k_pos < params.seqLen; k_pos++) {
    attn_scores[k_pos] = -1e9;
  }

  workgroupBarrier();

  // Step 2: Softmax - find max
  if (lid.x == 0u && lid.y == 0u) {
    attn_max = attn_scores[0];
    for (var i = 1u; i < params.seqLen; i++) {
      attn_max = max(attn_max, attn_scores[i]);
    }
  }

  workgroupBarrier();

  // Step 3: Softmax - exp and sum
  if (lid.x == 0u && lid.y == 0u) {
    attn_sum = 0.0;
    for (var i = 0u; i < params.seqLen; i++) {
      attn_scores[i] = exp(attn_scores[i] - attn_max);
      attn_sum += attn_scores[i];
    }
  }

  workgroupBarrier();

  // Step 4: Softmax - normalize
  for (var i = lid.x; i < params.seqLen; i += 16u) {
    attn_scores[i] /= attn_sum;
  }

  workgroupBarrier();

  // Step 5: Weighted sum of values
  let out_offset = head_offset + seq_pos * params.headDim;
  for (var d = 0u; d < params.headDim; d++) {
    var sum = 0.0;
    for (var v_pos = 0u; v_pos <= seq_pos; v_pos++) {
      let v_offset = head_offset + v_pos * params.headDim;
      sum += attn_scores[v_pos] * value[v_offset + d];
    }
    output[out_offset + d] = sum;
  }
}

// Flash Attention variant for longer sequences
@compute @workgroup_size(64)
fn flash_attention(
  @builtin(global_invocation_id) gid: vec3<u32>,
  @builtin(local_invocation_id) lid: vec3<u32>
) {
  // Block-sparse attention for efficiency
  // TODO: Implement full flash attention algorithm
}
