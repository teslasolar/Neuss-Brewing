// ⚡ Matrix Multiplication Kernels
// Optimized for WebGPU with tiling

struct Dims {
  M: u32,  // Rows of A, rows of C
  K: u32,  // Cols of A, rows of B
  N: u32,  // Cols of B, cols of C
  pad: u32,
}

@group(0) @binding(0) var<storage, read> a: array<f32>;
@group(0) @binding(1) var<storage, read> b: array<f32>;
@group(0) @binding(2) var<storage, read_write> c: array<f32>;
@group(0) @binding(3) var<uniform> dims: Dims;

// Tile size for shared memory optimization
const TILE_SIZE: u32 = 16u;

// Shared memory for tiled matmul
var<workgroup> tile_a: array<f32, 256>; // 16x16
var<workgroup> tile_b: array<f32, 256>; // 16x16

// Basic matrix multiply: C = A @ B
@compute @workgroup_size(16, 16)
fn matmul(@builtin(global_invocation_id) gid: vec3<u32>) {
  let row = gid.x;
  let col = gid.y;

  if (row >= dims.M || col >= dims.N) {
    return;
  }

  var sum = 0.0;
  for (var k = 0u; k < dims.K; k++) {
    sum += a[row * dims.K + k] * b[k * dims.N + col];
  }
  c[row * dims.N + col] = sum;
}

// Tiled matrix multiply for better cache utilization
@compute @workgroup_size(16, 16)
fn matmul_tiled(
  @builtin(global_invocation_id) gid: vec3<u32>,
  @builtin(local_invocation_id) lid: vec3<u32>,
  @builtin(workgroup_id) wid: vec3<u32>
) {
  let row = wid.x * TILE_SIZE + lid.x;
  let col = wid.y * TILE_SIZE + lid.y;
  let local_row = lid.x;
  let local_col = lid.y;

  var sum = 0.0;
  let num_tiles = (dims.K + TILE_SIZE - 1u) / TILE_SIZE;

  for (var t = 0u; t < num_tiles; t++) {
    // Load tiles into shared memory
    let a_col = t * TILE_SIZE + local_col;
    let b_row = t * TILE_SIZE + local_row;

    if (row < dims.M && a_col < dims.K) {
      tile_a[local_row * TILE_SIZE + local_col] = a[row * dims.K + a_col];
    } else {
      tile_a[local_row * TILE_SIZE + local_col] = 0.0;
    }

    if (b_row < dims.K && col < dims.N) {
      tile_b[local_row * TILE_SIZE + local_col] = b[b_row * dims.N + col];
    } else {
      tile_b[local_row * TILE_SIZE + local_col] = 0.0;
    }

    workgroupBarrier();

    // Compute partial sum for this tile
    for (var k = 0u; k < TILE_SIZE; k++) {
      sum += tile_a[local_row * TILE_SIZE + k] * tile_b[k * TILE_SIZE + local_col];
    }

    workgroupBarrier();
  }

  if (row < dims.M && col < dims.N) {
    c[row * dims.N + col] = sum;
  }
}

// Batched matrix multiply for multiple heads
@compute @workgroup_size(16, 16)
fn batched_matmul(
  @builtin(global_invocation_id) gid: vec3<u32>
) {
  let batch = gid.z;
  let row = gid.x;
  let col = gid.y;

  if (row >= dims.M || col >= dims.N) {
    return;
  }

  let batch_offset_a = batch * dims.M * dims.K;
  let batch_offset_b = batch * dims.K * dims.N;
  let batch_offset_c = batch * dims.M * dims.N;

  var sum = 0.0;
  for (var k = 0u; k < dims.K; k++) {
    sum += a[batch_offset_a + row * dims.K + k] *
           b[batch_offset_b + k * dims.N + col];
  }
  c[batch_offset_c + row * dims.N + col] = sum;
}

// Matrix-vector multiply: y = A @ x
@compute @workgroup_size(256)
fn matvec(@builtin(global_invocation_id) gid: vec3<u32>) {
  let row = gid.x;

  if (row >= dims.M) {
    return;
  }

  var sum = 0.0;
  for (var k = 0u; k < dims.K; k++) {
    sum += a[row * dims.K + k] * b[k];
  }
  c[row] = sum;
}
