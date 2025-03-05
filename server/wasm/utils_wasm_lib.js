let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;
let wasm;
const { TextEncoder, TextDecoder } = require(`util`);

let WASM_VECTOR_LEN = 0;
let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
  if (
    cachedUint8ArrayMemory0 === null ||
    cachedUint8ArrayMemory0.byteLength === 0
  ) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}

let cachedTextEncoder = new TextEncoder('utf-8');

const encodeString =
  typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
        return cachedTextEncoder.encodeInto(arg, view);
      }
    : function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
          read: arg.length,
          written: buf.length,
        };
      };

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0()
      .subarray(ptr, ptr + buf.length)
      .set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;

  const mem = getUint8ArrayMemory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7f) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, (len = offset + arg.length * 3), 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);

    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

function isLikeNone(x) {
  return x === undefined || x === null;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
  if (
    cachedDataViewMemory0 === null ||
    cachedDataViewMemory0.buffer.detached === true ||
    (cachedDataViewMemory0.buffer.detached === undefined &&
      cachedDataViewMemory0.buffer !== wasm.memory.buffer)
  ) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
  }
  return cachedDataViewMemory0;
}

let cachedTextDecoder = new TextDecoder('utf-8', {
  ignoreBOM: true,
  fatal: true,
});

cachedTextDecoder.decode();

function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(
    getUint8ArrayMemory0().subarray(ptr, ptr + len)
  );
}
/**
 * @param {number} a
 * @param {number} b
 * @returns {string}
 */
module.exports.add = function (a, b) {
  let deferred1_0;
  let deferred1_1;
  try {
    const ret = wasm.add(a, b);
    deferred1_0 = ret[0];
    deferred1_1 = ret[1];
    return getStringFromWasm0(ret[0], ret[1]);
  } finally {
    wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
  }
};

/**
 * @param {string} message
 */
module.exports.hello = function (message) {
  const ptr0 = passStringToWasm0(
    message,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  const len0 = WASM_VECTOR_LEN;
  wasm.hello(ptr0, len0);
};

function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0;
  getUint8ArrayMemory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
/**
 * @param {Uint8Array} input
 * @returns {string}
 */
module.exports.encode_base64 = function (input) {
  let deferred2_0;
  let deferred2_1;
  try {
    const ptr0 = passArray8ToWasm0(input, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.encode_base64(ptr0, len0);
    deferred2_0 = ret[0];
    deferred2_1 = ret[1];
    return getStringFromWasm0(ret[0], ret[1]);
  } finally {
    wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
  }
};

/**
 * @param {string} base64_string
 * @returns {any}
 */
module.exports.decode_base64_to_bytes = function (base64_string) {
  const ptr0 = passStringToWasm0(
    base64_string,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.decode_base64_to_bytes(ptr0, len0);
  return ret;
};

/**
 * @param {string} binary_string
 * @returns {Uint8Array | undefined}
 */
module.exports.binary_string_to_bytes = function (binary_string) {
  const ptr0 = passStringToWasm0(
    binary_string,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc
  );
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.binary_string_to_bytes(ptr0, len0);
  return ret;
};

/**
 * @param {any} content
 * @returns {any}
 */
module.exports.check_content_and_convert = function (content) {
  const ret = wasm.check_content_and_convert(content);
  return ret;
};

module.exports.__wbg_buffer_609cc3eee51ed158 = function (arg0) {
  const ret = arg0.buffer;
  return ret;
};

module.exports.__wbg_instanceof_Uint8Array_17156bcf118086a9 = function (arg0) {
  let result;
  try {
    result = arg0 instanceof Uint8Array;
  } catch (_) {
    result = false;
  }
  const ret = result;
  return ret;
};

module.exports.__wbg_length_a446193dc22c12f8 = function (arg0) {
  const ret = arg0.length;
  return ret;
};

module.exports.__wbg_log_c222819a41e063d3 = function (arg0) {
  console.log(arg0);
};

module.exports.__wbg_newwithbyteoffsetandlength_d97e637ebe145a9a = function (
  arg0,
  arg1,
  arg2
) {
  const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
  return ret;
};

module.exports.__wbg_newwithlength_a381634e90c276d4 = function (arg0) {
  const ret = new Uint8Array(arg0 >>> 0);
  return ret;
};

module.exports.__wbg_set_65595bdd868b3009 = function (arg0, arg1, arg2) {
  arg0.set(arg1, arg2 >>> 0);
};

module.exports.__wbindgen_init_externref_table = function () {
  const table = wasm.__wbindgen_export_1;
  const offset = table.grow(4);
  table.set(0, undefined);
  table.set(offset + 0, undefined);
  table.set(offset + 1, null);
  table.set(offset + 2, true);
  table.set(offset + 3, false);
};

module.exports.__wbindgen_memory = function () {
  const ret = wasm.memory;
  return ret;
};

module.exports.__wbindgen_string_get = function (arg0, arg1) {
  const obj = arg1;
  const ret = typeof obj === 'string' ? obj : undefined;
  var ptr1 = isLikeNone(ret)
    ? 0
    : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  var len1 = WASM_VECTOR_LEN;
  getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
  getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

module.exports.__wbindgen_string_new = function (arg0, arg1) {
  const ret = getStringFromWasm0(arg0, arg1);
  return ret;
};

module.exports.__wbindgen_throw = function (arg0, arg1) {
  throw new Error(getStringFromWasm0(arg0, arg1));
};

const path = require('path').join(__dirname, 'utils_wasm_lib_bg.wasm');
const bytes = require('fs').readFileSync(path);

const wasmModule = new WebAssembly.Module(bytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
wasm = wasmInstance.exports;
module.exports.__wasm = wasm;

wasm.__wbindgen_start();
