// Generated from compound.wit by tests/snapshots.rs. Do not edit;
// run with BLESS=1 to update.
//
// core exports (JS function the embedding calls):
//   example:compound/shapes#area(i32, i32, i32) -> i64 -> export_shapes$area
//   example:compound/shapes#centroid(i32, i32) -> i32 [retptr 12 bytes] -> export_shapes$centroid
//   example:compound/shapes#parse-color(i32, i32) -> i32 [retptr 2 bytes] -> export_shapes$parseColor
//   example:compound/shapes#styles(i32) -> i32 [retptr 8 bytes] -> export_shapes$styles
//   example:compound/shapes#checksum(i32, i32) -> i32 -> export_shapes$checksum
//
// core imports (JS function the embedding provides):
//   example:compound/store get(i32, i32, i32) [retptr 12 bytes] <- $import_example_compound_store$get
//   example:compound/store set(i32, i32, i32, i32, i32) [retptr 12 bytes] <- $import_example_compound_store$set
//
// import modules:
//   example:compound/store: import_example_compound_store$get as get, import_example_compound_store$set as set

let repCnt = 1;
let repTable = new Map();



let dv = new DataView(new ArrayBuffer());
const dataView = mem => dv.buffer === mem.buffer ? dv : dv = new DataView(mem.buffer);

const memoryView = (ty, mem, ptr, len) => new ty(mem.buffer, ptr, len);

const memoryWrite = (mem, ptr, bytes) => new Uint8Array(mem.buffer, ptr, bytes.byteLength).set(bytes);

function toUint64(val) {
  const converted = BigInt(val)
  
  return BigInt.asUintN(64, converted);
}


function toInt32(val) {
  
  return val >> 0;
}


function toUint32(val) {
  
  return val >>> 0;
}


function _isValidNumericPrimitive(ty, v) {
  if (v === undefined || v === null) { return false; }
  switch (ty) {
    case 'bool':
    return v === 0 || v === 1;
    break;
    case 'u8':
    return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 255;
    break;
    case 's8':
    return typeof v === 'number' && Number.isInteger(v) && v >= -128 && v <= 127;
    break;
    case 'u16':
    return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 65535;
    break;
    case 's16':
    return typeof v === 'number' && Number.isInteger(v) && v >= -32768 && v <= 32767;
    case 'u32':
    return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 4_294_967_295;
    case 's32':
    return typeof v === 'number' && Number.isInteger(v) && v >= -2_147_483_648 && v <= 2_147_483_647;
    case 'u64':
    return typeof v === 'bigint' && v >= 0 && v <= 18_446_744_073_709_551_615n;
    case 's64':
    return typeof v === 'bigint' && v >= -9223372036854775808n && v <= 9223372036854775807n;
    break;
    case 'f32':
    case 'f64': return typeof v === 'number';
    default:
    return false;
  }
  return true;
}

function _requireValidNumericPrimitive(ty, v) {
  if (v === undefined  || v === null || !_isValidNumericPrimitive(ty, v)) {
    throw new TypeError(`invalid ${ty} value [${v}]`);
  }
  return true;
}
const TEXT_DECODER_UTF8 = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
const TEXT_ENCODER_UTF8 = new TextEncoder();

function _utf8AllocateAndEncode(s, realloc, memory) {
  if (typeof s !== 'string') {
    throw new TypeError('expected a string, received [' + typeof s + ']');
  }
  if (s.length === 0) { return { ptr: 1, len: 0 }; }
  // Compute the exact allocation size up front. Some older preview1
  // adapters only support an initial allocation, not a subsequent shrink.
  let len = 0;
  let codepoints = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    codepoints++;
    if (ch < 0x80) { len += 1; }
    else if (ch < 0x800) { len += 2; }
    else if (ch >= 0xd800 && ch <= 0xdbff &&
    i + 1 < s.length &&
    (s.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
      len += 4;
      i++;
    } else { len += 3; }
  }
  const ptr = realloc(0, 0, 1, len);
  const { read, written } = TEXT_ENCODER_UTF8.encodeInto(
  s,
  new Uint8Array(memory.buffer, ptr, len),
  );
  if (read !== s.length || written !== len) {
    throw new Error('failed to encode whole string');
  }
  const res = { ptr, len, codepoints };
  return res;
}


const _debugLog = (...args) => {
  if (!globalThis?.process?.env?.JCO_DEBUG) { return; }
  console.debug(...args);
};

class ComponentError extends Error {
  constructor (value) {
    const enumerable = typeof value !== 'string';
    super(enumerable ? `${String(value)} (see error.payload)` : value);
    Object.defineProperty(this, 'payload', { value, enumerable });
  }
}
const WebAssemblyRuntimeError = WebAssembly.RuntimeError;

const hasOwnProperty = Object.prototype.hasOwnProperty;

function getErrorPayload(e) {
  if (e && hasOwnProperty.call(e, 'payload')) return e.payload;
  if (e instanceof Error) throw e;
  return e;
}

function import_example_compound_store$get(arg0) {
  
  var encodeRes = _utf8AllocateAndEncode(arg0, $realloc, $memory);
  var ptr0= encodeRes.ptr;
  var len0 = encodeRes.len;
  
  _debugLog('[Instruction::CallWasm] enter', {
    funcName: 'get',
    paramCount: 2,
    async: false,
    postReturn: true,
  });
  let ret;
  
  ret = $import_example_compound_store$get(ptr0, len0);
  let variant2;
  if (dataView($memory).getUint8(((ret >>> 0)) + 0, true)) {
    var ptr1 = dataView($memory).getUint32(((ret >>> 0)) + 4, true) >>> 0;
    var len1 = dataView($memory).getUint32(((ret >>> 0)) + 8, true);
    if (ptr1 < 0 || len1 < 0 || len1 > 268435455 || ptr1 > $memory.buffer.byteLength || len1 > Math.floor(($memory.buffer.byteLength - ptr1) / 1)) throw new WebAssemblyRuntimeError('wasm trap: out of bounds memory access');
    if (ptr1 % 1 !== 0) throw new TypeError(`list pointer [${ptr1}] is not aligned to 1`);
    var result1 = memoryView(Uint8Array, $memory, ptr1, len1).slice();
    if (len1 !== 0) $dealloc(ptr1, len1, 1);
    variant2 = result1;
  } else {
    variant2 = undefined;
  }
  _debugLog('[Instruction::Return]', {
    funcName: 'get',
    paramCount: 1,
    async: false,
    postReturn: true
  });
  const retCopy = variant2;
  $dealloc(ret);
  return retCopy;
}

function import_example_compound_store$set(arg0, arg1) {
  
  var encodeRes = _utf8AllocateAndEncode(arg0, $realloc, $memory);
  var ptr0= encodeRes.ptr;
  var len0 = encodeRes.len;
  
  var val1 = arg1;
  var len1 = Array.isArray(val1) ? val1.length : val1.byteLength;
  var ptr1 = $realloc(0, 0, 1, len1 * 1);
  
  let valData1;
  const valLenBytes1 = len1 * 1;
  if (Array.isArray(val1)) {
    // Regular array likely containing numbers, write values to memory
    let offset = 0;
    const dv1 = dataView($memory);
    for (const v of val1) {
      _requireValidNumericPrimitive.bind(null, 'u8')(v);
      dv1.setUint8(ptr1+ offset, v, true);
      offset += 1;
    }
  } else {
    // TypedArray / ArrayBuffer-like, direct copy
    valData1 = new Uint8Array(val1.buffer || val1, val1.byteOffset, valLenBytes1);
    memoryWrite($memory, ptr1, valData1);
  }
  
  _debugLog('[Instruction::CallWasm] enter', {
    funcName: 'set',
    paramCount: 4,
    async: false,
    postReturn: true,
  });
  let ret;
  
  ret = $import_example_compound_store$set(ptr0, len0, ptr1, len1);
  let variant3;
  if (dataView($memory).getUint8(((ret >>> 0)) + 0, true)) {
    var ptr2 = dataView($memory).getUint32(((ret >>> 0)) + 4, true) >>> 0;
    var len2 = dataView($memory).getUint32(((ret >>> 0)) + 8, true);
    var result2 = TEXT_DECODER_UTF8.decode(memoryView(Uint8Array, $memory, ptr2, len2));
    if (len2 !== 0) $dealloc(ptr2, len2, 1);
    variant3= {
      tag: 'err',
      val: result2
    };
  } else {
    variant3= {
      tag: 'ok',
      val: undefined
    };
  }
  _debugLog('[Instruction::Return]', {
    funcName: 'set',
    paramCount: 1,
    async: false,
    postReturn: true
  });
  const retCopy = variant3;
  $dealloc(ret);
  
  
  if (typeof retCopy === 'object' && retCopy.tag === 'err') {
    throw new ComponentError(retCopy.val);
  }
  return retCopy.val;
  
}

function export_shapes$area(arg0, arg1, arg2) {
  let variant0;
  switch (arg0) {
    case 0: {
      variant0= {
        tag: 'circle',
        val: arg1 >>> 0
      };
      break;
    }
    case 1: {
      variant0= {
        tag: 'rect',
        val: [arg1 >>> 0, arg2 >>> 0]
      };
      break;
    }
    case 2: {
      variant0= {
        tag: 'empty',
      };
      break;
    }
  }
  _debugLog(' [Instruction::CallInterface] (sync, @ enter)');
  let ret;
  
  ret = shapesArea(variant0);
  _debugLog('[Instruction::Return]', {
    funcName: 'area',
    paramCount: 1,
    async: false,
    postReturn: false
  });
  return toUint64(ret);
}

function export_shapes$centroid(arg0, arg1, arg2) {
  var len0 = arg1;
  var base0 = arg0 >>> 0;
  if (base0 < 0 || len0 < 0 || len0 > 33554431 || base0 > $memory.buffer.byteLength || len0 > Math.floor(($memory.buffer.byteLength - base0) / 8)) throw new WebAssemblyRuntimeError('wasm trap: out of bounds memory access');
  if (base0 % 4 !== 0) throw new TypeError(`list pointer [${base0}] is not aligned to 4`);
  var result0 = [];
  for (let i = 0; i < len0; i++) {
    const base = base0 + i * 8;
    result0.push({
      x: dataView($memory).getInt32((base) + 0, true),
      y: dataView($memory).getInt32((base) + 4, true),
    });
  }
  if (len0 !== 0) $dealloc(base0, len0 * 8, 4);
  _debugLog(' [Instruction::CallInterface] (sync, @ enter)');
  let ret;
  
  ret = shapesCentroid(result0);
  var variant2 = ret;
  if (variant2 === null || variant2=== undefined) {
    dataView($memory).setInt8((arg2) + 0, 0, true);
  } else {
    const e = variant2;
    dataView($memory).setInt8((arg2) + 0, 1, true);
    var {x: v1_0, y: v1_1 } = e;
    dataView($memory).setInt32((arg2) + 4, toInt32(v1_0), true);
    dataView($memory).setInt32((arg2) + 8, toInt32(v1_1), true);
  }
  _debugLog('[Instruction::Return]', {
    funcName: 'centroid',
    paramCount: 0,
    async: false,
    postReturn: false
  });
  return;
}

function export_shapes$parseColor(arg0, arg1, arg2) {
  var ptr0 = arg0 >>> 0;
  var len0 = arg1;
  var result0 = TEXT_DECODER_UTF8.decode(memoryView(Uint8Array, $memory, ptr0, len0));
  if (len0 !== 0) $dealloc(ptr0, len0, 1);
  _debugLog(' [Instruction::CallInterface] (sync, @ enter)');
  let ret;
  
  try {
    const hostRet1 = shapesParseColor(result0);
    ret = hostRet1 !== null && typeof hostRet1 === 'object' && (hostRet1.tag === 'ok' || hostRet1.tag === 'err')
    ? hostRet1
    : { tag: 'ok', val: hostRet1};
  } catch (e) {
    
    ret = { tag: 'err', val: getErrorPayload(e) };
  }
  
  var variant4 = ret;
  switch (variant4.tag) {
    case 'ok': {
      const e = variant4.val;
      dataView($memory).setInt8((arg2) + 0, 0, true);
      var val2 = e;
      let enum2;
      switch (val2) {
        case 'red': {
          enum2 = 0;
          break;
        }
        case 'green': {
          enum2 = 1;
          break;
        }
        case 'blue': {
          enum2 = 2;
          break;
        }
        default: {
          
          throw new TypeError(`"${val2}" is not one of the cases of color`);
        }
      }
      dataView($memory).setInt8((arg2) + 1, enum2, true);
      
      break;
    }
    case 'err': {
      const e = variant4.val;
      dataView($memory).setInt8((arg2) + 0, 1, true);
      var val3 = e;
      let enum3;
      switch (val3) {
        case 'not-found': {
          enum3 = 0;
          break;
        }
        case 'invalid': {
          enum3 = 1;
          break;
        }
        default: {
          
          throw new TypeError(`"${val3}" is not one of the cases of error`);
        }
      }
      dataView($memory).setInt8((arg2) + 1, enum3, true);
      
      break;
    }
    default: {
      _debugLog("ERROR: invalid value (expected result as object with 'tag' member)", { value: variant4, valueType: typeof variant4});
      throw new TypeError('invalid variant specified for result');
    }
  }
  _debugLog('[Instruction::Return]', {
    funcName: 'parse-color',
    paramCount: 0,
    async: false,
    postReturn: false
  });
  return;
}

function export_shapes$styles(arg0, arg1) {
  var flags0 = {
    bold: Boolean(arg0 & 1),
    italic: Boolean(arg0 & 2),
    underline: Boolean(arg0 & 4),
  };
  _debugLog(' [Instruction::CallInterface] (sync, @ enter)');
  let ret;
  
  ret = shapesStyles(flags0);
  var vec2 = ret;
  var len2 = vec2.length;
  var result2 = $realloc(0, 0, 4, len2 * 8);
  if (result2 < 0 || len2 < 0 || len2 > 33554431 || result2 > $memory.buffer.byteLength || len2 > Math.floor(($memory.buffer.byteLength - result2) / 8)) throw new WebAssemblyRuntimeError('wasm trap: out of bounds memory access');
  for (let i = 0; i < vec2.length; i++) {
    const e = vec2[i];
    const base = result2 + i * 8;
    var encodeRes = _utf8AllocateAndEncode(e, $realloc, $memory);
    var ptr1= encodeRes.ptr;
    var len1 = encodeRes.len;
    
    dataView($memory).setUint32((base) + 4, len1, true);
    dataView($memory).setUint32((base) + 0, ptr1, true);
  }
  dataView($memory).setUint32((arg1) + 4, len2, true);
  dataView($memory).setUint32((arg1) + 0, result2, true);
  _debugLog('[Instruction::Return]', {
    funcName: 'styles',
    paramCount: 0,
    async: false,
    postReturn: false
  });
  return;
}

function export_shapes$checksum(arg0, arg1) {
  var ptr0 = arg0 >>> 0;
  var len0 = arg1;
  if (ptr0 < 0 || len0 < 0 || len0 > 268435455 || ptr0 > $memory.buffer.byteLength || len0 > Math.floor(($memory.buffer.byteLength - ptr0) / 1)) throw new WebAssemblyRuntimeError('wasm trap: out of bounds memory access');
  if (ptr0 % 1 !== 0) throw new TypeError(`list pointer [${ptr0}] is not aligned to 1`);
  var result0 = memoryView(Uint8Array, $memory, ptr0, len0).slice();
  if (len0 !== 0) $dealloc(ptr0, len0, 1);
  _debugLog(' [Instruction::CallInterface] (sync, @ enter)');
  let ret;
  
  ret = shapesChecksum(result0);
  _debugLog('[Instruction::Return]', {
    funcName: 'checksum',
    paramCount: 1,
    async: false,
    postReturn: false
  });
  return toUint32(ret);
}

class BindingsError extends Error {
  constructor (path, type, helpContext, help) {
    super(`"${__sourceName}" does not export a "${path}" ${type} as expected by the world.${
      help ? `\n  Try defining it${helpContext}:\n${help.split('\n').map(ln => `  ${ln}`).join('\n')}` : ''}`);
    }
  }
  function getInterfaceExport (mod, exportNameOrAlias, exportId) {
    if (typeof mod[exportId] === 'object')
    return mod[exportId];
    if (exportNameOrAlias && typeof mod[exportNameOrAlias] === 'object')
    return mod[exportNameOrAlias];
    if (!exportNameOrAlias)
    throw new BindingsError(exportId, 'interface', ' by its qualified interface name', `const obj = {};
    
    export { obj as '${exportId}' }
    `);
    else
    throw new BindingsError(exportNameOrAlias, 'interface', exportId && exportNameOrAlias ? ' by its alias' : ' by name', `export const ${exportNameOrAlias} = {};`);
  }
  function verifyInterfaceFn (fn, exportName, ifaceProp, interfaceExportAlias) {
    if (typeof fn !== 'function') {
      if (!interfaceExportAlias)
      throw new BindingsError(exportName, `${ifaceProp} function`, ' on the exported interface object', `const obj = {
        ${ifaceProp} () {
          
        }
      };
      
      export { obj as '${exportName}' }
      `);
      else
      throw new BindingsError(exportName, `${ifaceProp} function`, ` on the interface alias "${interfaceExportAlias}"`, `export const ${interfaceExportAlias} = {
        ${ifaceProp} () {
          
        }
      };`);
    }
  }
  function verifyInterfaceResource (fn, exportName, ifaceProp, interfaceExportAlias) {
    if (typeof fn !== 'function') {
      if (!interfaceExportAlias)
      throw new BindingsError(exportName, `${ifaceProp} resource`, ' on the exported interface object', `const obj = {
        ${ifaceProp} () {
          
        }
      };
      
      export { obj as '${exportName}' }
      `);
      else
      throw new BindingsError(exportName, `${ifaceProp} resource`, ` on the interface alias "${interfaceExportAlias}"`, `export const ${interfaceExportAlias} = {
        ${ifaceProp} () {
          
        }
      };`);
    }
  }
  
  let shapesArea, shapesCentroid, shapesChecksum, shapesParseColor, shapesStyles;
  let __sourceName = 'source module';
  export function bindExports($source_mod) {
    let __iface;
    __iface = getInterfaceExport($source_mod, 'shapes', 'example:compound/shapes');
    shapesArea = __iface.area;
    shapesCentroid = __iface.centroid;
    shapesChecksum = __iface.checksum;
    shapesParseColor = __iface.parseColor;
    shapesStyles = __iface.styles;
    verifyInterfaceFn(shapesArea, 'example:compound/shapes', 'area', 'shapes');
    verifyInterfaceFn(shapesCentroid, 'example:compound/shapes', 'centroid', 'shapes');
    verifyInterfaceFn(shapesChecksum, 'example:compound/shapes', 'checksum', 'shapes');
    verifyInterfaceFn(shapesParseColor, 'example:compound/shapes', 'parseColor', 'shapes');
    verifyInterfaceFn(shapesStyles, 'example:compound/shapes', 'styles', 'shapes');
  }
  