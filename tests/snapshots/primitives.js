// Generated from primitives.wit by tests/snapshots.rs. Do not edit;
// run with BLESS=1 to update.
//
// core exports (JS function the embedding calls):
//   add(i32, i32) -> i32 -> export_add
//   negate(i64) -> i64 -> export_negate
//   scale(f32, f64) -> f64 -> export_scale
//   is-even(i32) -> i32 -> export_isEven
//   next-char(i32) -> i32 -> export_nextChar
//   greet(i32, i32) -> i32 [retptr 8 bytes] -> export_greet
//
// core imports (JS function the embedding provides):
//   $root now() -> i64 <- $import_now$now
//   $root print(i32, i32) <- $import_print$print
//
// import modules:
//   now: import_now$now as default
//   print: import_print$print as default

let repCnt = 1;
let repTable = new Map();



let dv = new DataView(new ArrayBuffer());
const dataView = mem => dv.buffer === mem.buffer ? dv : dv = new DataView(mem.buffer);

const memoryView = (ty, mem, ptr, len) => new ty(mem.buffer, ptr, len);

function toInt64(val) {
  const converted = BigInt(val)
  
  return BigInt.asIntN(64, converted);
}


function toUint32(val) {
  
  return val >>> 0;
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


function validateGuestChar(i) {
  if ((i > 0x10ffff) || (i >= 0xd800 && i <= 0xdfff)) { throw new TypeError(`not a valid char`); }
  return String.fromCodePoint(i);
}


function validateHostChar(s) {
  if (typeof s !== 'string') { throw new TypeError(`must be a string`); }
  return s.codePointAt(0);
}


const _debugLog = (...args) => {
  if (!globalThis?.process?.env?.JCO_DEBUG) { return; }
  console.debug(...args);
};

function clampGuest(i, min, max) {
  if (i < min || i > max) {
    throw new TypeError(`must be between ${min} and ${max}`);
  }
  return i;
}


function import_now$now() {
  _debugLog('[Instruction::CallWasm] enter', {
    funcName: 'now',
    paramCount: 0,
    async: false,
    postReturn: false,
  });
  let ret;
  
  ret = $import_now$now();
  _debugLog('[Instruction::Return]', {
    funcName: 'now',
    paramCount: 1,
    async: false,
    postReturn: false
  });
  return BigInt.asUintN(64, BigInt(ret));
}

function import_print$print(arg0) {
  
  var encodeRes = _utf8AllocateAndEncode(arg0, $realloc, $memory);
  var ptr0= encodeRes.ptr;
  var len0 = encodeRes.len;
  
  _debugLog('[Instruction::CallWasm] enter', {
    funcName: 'print',
    paramCount: 2,
    async: false,
    postReturn: false,
  });
  let ret;
  
  $import_print$print(ptr0, len0);
  _debugLog('[Instruction::Return]', {
    funcName: 'print',
    paramCount: 0,
    async: false,
    postReturn: false
  });
  return;
}

function export_add(arg0, arg1) {
  _debugLog(' [Instruction::CallInterface] (sync, @ enter)');
  let ret;
  
  ret = add(arg0 >>> 0, arg1 >>> 0);
  _debugLog('[Instruction::Return]', {
    funcName: 'add',
    paramCount: 1,
    async: false,
    postReturn: false
  });
  return toUint32(ret);
}

function export_negate(arg0) {
  _debugLog(' [Instruction::CallInterface] (sync, @ enter)');
  let ret;
  
  ret = negate(arg0);
  _debugLog('[Instruction::Return]', {
    funcName: 'negate',
    paramCount: 1,
    async: false,
    postReturn: false
  });
  return toInt64(ret);
}

function export_scale(arg0, arg1) {
  _debugLog(' [Instruction::CallInterface] (sync, @ enter)');
  let ret;
  
  ret = scale(arg0, arg1);
  _debugLog('[Instruction::Return]', {
    funcName: 'scale',
    paramCount: 1,
    async: false,
    postReturn: false
  });
  return +ret;
}

function export_isEven(arg0) {
  _debugLog(' [Instruction::CallInterface] (sync, @ enter)');
  let ret;
  
  ret = isEven(clampGuest(arg0, 0, 255));
  _debugLog('[Instruction::Return]', {
    funcName: 'is-even',
    paramCount: 1,
    async: false,
    postReturn: false
  });
  return ret ? 1 : 0;
}

function export_nextChar(arg0) {
  _debugLog(' [Instruction::CallInterface] (sync, @ enter)');
  let ret;
  
  ret = nextChar(validateGuestChar(arg0));
  _debugLog('[Instruction::Return]', {
    funcName: 'next-char',
    paramCount: 1,
    async: false,
    postReturn: false
  });
  return validateHostChar(ret);
}

function export_greet(arg0, arg1, arg2) {
  var ptr0 = arg0 >>> 0;
  var len0 = arg1;
  var result0 = TEXT_DECODER_UTF8.decode(memoryView(Uint8Array, $memory, ptr0, len0));
  if (len0 !== 0) $dealloc(ptr0, len0, 1);
  _debugLog(' [Instruction::CallInterface] (sync, @ enter)');
  let ret;
  
  ret = greet(result0);
  
  var encodeRes = _utf8AllocateAndEncode(ret, $realloc, $memory);
  var ptr1= encodeRes.ptr;
  var len1 = encodeRes.len;
  
  dataView($memory).setUint32((arg2) + 4, len1, true);
  dataView($memory).setUint32((arg2) + 0, ptr1, true);
  _debugLog('[Instruction::Return]', {
    funcName: 'greet',
    paramCount: 0,
    async: false,
    postReturn: false
  });
  return;
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
  
  
  let add;
  
  
  let greet;
  
  
  let isEven;
  
  
  let negate;
  
  
  let nextChar;
  
  
  let scale;
  
  let __sourceName = 'source module';
  export function bindExports($source_mod) {
    let __iface;
    add = $source_mod.add;
    if (typeof add!== 'function')
    throw new BindingsError('add', 'function', '', `export function add() {};
    `);
    
    
    greet = $source_mod.greet;
    if (typeof greet!== 'function')
    throw new BindingsError('greet', 'function', '', `export function greet() {};
    `);
    
    
    isEven = $source_mod.isEven;
    if (typeof isEven!== 'function')
    throw new BindingsError('isEven', 'function', '', `export function isEven() {};
    `);
    
    
    negate = $source_mod.negate;
    if (typeof negate!== 'function')
    throw new BindingsError('negate', 'function', '', `export function negate() {};
    `);
    
    
    nextChar = $source_mod.nextChar;
    if (typeof nextChar!== 'function')
    throw new BindingsError('nextChar', 'function', '', `export function nextChar() {};
    `);
    
    
    scale = $source_mod.scale;
    if (typeof scale!== 'function')
    throw new BindingsError('scale', 'function', '', `export function scale() {};
    `);
    
  }
  