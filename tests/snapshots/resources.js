// Generated from resources.wit by tests/snapshots.rs. Do not edit;
// run with BLESS=1 to update.
//
// core exports (JS function the embedding calls):
//   example:counter/types#[dtor]counter(i32) -> export_types$counter$dtor
//   example:counter/types#[constructor]counter(i32, i32, i32) -> i32 -> export_types$counter$constructor
//   example:counter/types#[method]counter.inc(i32, i32) -> i32 -> export_types$counter$method$inc
//   example:counter/types#[method]counter.stats(i32) -> i32 [retptr 12 bytes] -> export_types$counter$method$stats
//   example:counter/types#[static]counter.merge(i32, i32) -> i32 -> export_types$counter$static$merge
//   example:counter/types#describe(i32) -> i32 [retptr 8 bytes] -> export_types$describe
//   example:counter/types#log-to(i32, i32) -> export_types$logTo
//   example:counter/types#make-logger(i32, i32) -> i32 -> export_types$makeLogger
//
// core imports (JS function the embedding provides):
//   example:counter/logging [constructor]logger(i32, i32) -> i32 <- $import_example_counter_logging$logger$constructor
//   example:counter/logging [method]logger.log(i32, i32, i32) <- $import_example_counter_logging$logger$method$log
//   [export]example:counter/types [resource-new]counter(i32) -> i32 <- $resource_types$new$counter
//   [export]example:counter/types [resource-rep]counter(i32) -> i32 <- $resource_types$rep$counter
//   [export]example:counter/types [resource-drop]counter(i32) <- $resource_export$types$drop$counter
//   example:counter/logging [resource-drop]logger(i32) <- $resource_import$logging$drop$logger
//
// import modules:
//   example:counter/logging: import_logging$Logger as Logger

let repCnt = 1;
let repTable = new Map();

const finalizationRegistry_export$types$counter = new FinalizationRegistry((handle) => {
  $resource_export$types$drop$counter(handle);
});
const finalizationRegistry_import$logging$logger = new FinalizationRegistry((handle) => {
  $resource_import$logging$drop$logger(handle);
});


let dv = new DataView(new ArrayBuffer());
const dataView = mem => dv.buffer === mem.buffer ? dv : dv = new DataView(mem.buffer);

const memoryView = (ty, mem, ptr, len) => new ty(mem.buffer, ptr, len);

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


let curResourceBorrows = [];

const _debugLog = (...args) => {
  if (!globalThis?.process?.env?.JCO_DEBUG) { return; }
  console.debug(...args);
};

const symbolRscHandle = Symbol('handle');
const symbolDispose = Symbol.dispose || Symbol.for('dispose');

class import_logging$Logger {
  constructor(arg0) {
    
    var encodeRes = _utf8AllocateAndEncode(arg0, $realloc, $memory);
    var ptr0= encodeRes.ptr;
    var len0 = encodeRes.len;
    
    _debugLog('[Instruction::CallWasm] enter', {
      funcName: '[constructor]logger',
      paramCount: 2,
      async: false,
      postReturn: false,
    });
    let ret;
    
    ret = $import_example_counter_logging$logger$constructor(ptr0, len0);
    var handle2 = ret;
    
    var rsc1 = new.target === import_logging$Logger ? this : Object.create(import_logging$Logger.prototype);
    Object.defineProperty(rsc1, symbolRscHandle, { writable: true, value: handle2});
    finalizationRegistry_import$logging$logger.register(rsc1, handle2, rsc1);
    _debugLog('[Instruction::Return]', {
      funcName: '[constructor]logger',
      paramCount: 1,
      async: false,
      postReturn: false
    });
    return rsc1;
  }
  log(arg0) {
    function helper(arg0, arg1) {
      
      var handle0 = arg0[symbolRscHandle];
      finalizationRegistry_import$logging$logger.unregister(arg0);
      
      var encodeRes = _utf8AllocateAndEncode(arg1, $realloc, $memory);
      var ptr2= encodeRes.ptr;
      var len2 = encodeRes.len;
      
      _debugLog('[Instruction::CallWasm] enter', {
        funcName: '[method]logger.log',
        paramCount: 3,
        async: false,
        postReturn: false,
      });
      let ret;
      
      $import_example_counter_logging$logger$method$log(handle0, ptr2, len2);
      _debugLog('[Instruction::Return]', {
        funcName: '[method]logger.log',
        paramCount: 0,
        async: false,
        postReturn: false
      });
      return;
    }
    return helper(this, arg0);
  }
  
  [symbolDispose]() {
    finalizationRegistry_import$logging$logger.unregister(this);
    $resource_import$logging$drop$logger(this[symbolRscHandle]);
    this[symbolRscHandle] = undefined;
  }
}


function export_types$counter$dtor(rep) {
  const entry = repTable.get(rep);
  if (!entry) return;
  repTable.delete(rep);
  const resource = entry.rep;
  delete resource[symbolRscHandle];
  finalizationRegistry_export$types$counter.unregister(resource);
  if (resource[symbolDispose]) resource[symbolDispose]();
}


function export_types$counter$constructor(arg0, arg1, arg2) {
  var ptr0 = arg0 >>> 0;
  var len0 = arg1;
  var result0 = TEXT_DECODER_UTF8.decode(memoryView(Uint8Array, $memory, ptr0, len0));
  if (len0 !== 0) $dealloc(ptr0, len0, 1);
  _debugLog(' [Instruction::CallInterface] (sync, @ enter)');
  let ret;
  
  ret = new Counter(result0, arg2 >>> 0);
  
  if (!(ret instanceof Counter)) {
    throw new TypeError('Resource error: Not a valid \"Counter\" resource.');
  }
  let handle1 = ret[symbolRscHandle];
  if (handle1=== undefined) {
    var localRep2= repCnt++;
    repTable.set(localRep2, { rep: ret, own: true });
    handle1 = $resource_types$new$counter(localRep2);
    ret[symbolRscHandle] = handle1;
    finalizationRegistry_export$types$counter.register(ret, handle1, ret);
  }
  
  _debugLog('[Instruction::Return]', {
    funcName: '[constructor]counter',
    paramCount: 1,
    async: false,
    postReturn: false
  });
  return handle1;
}

function export_types$counter$method$inc(arg0, arg1) {
  var handle1 = arg0;
  var rsc0 = repTable.get(handle1).rep;
  _debugLog(' [Instruction::CallInterface] (sync, @ enter)');
  let ret;
  
  ret = Counter.prototype.inc.call(rsc0, arg1 >>> 0);
  _debugLog('[Instruction::Return]', {
    funcName: '[method]counter.inc',
    paramCount: 1,
    async: false,
    postReturn: false
  });
  return toUint32(ret);
}

function export_types$counter$method$stats(arg0, arg1) {
  var handle1 = arg0;
  var rsc0 = repTable.get(handle1).rep;
  _debugLog(' [Instruction::CallInterface] (sync, @ enter)');
  let ret;
  
  ret = Counter.prototype.stats.call(rsc0);
  var {name: v2_0, value: v2_1 } = ret;
  
  var encodeRes = _utf8AllocateAndEncode(v2_0, $realloc, $memory);
  var ptr3= encodeRes.ptr;
  var len3 = encodeRes.len;
  
  dataView($memory).setUint32((arg1) + 4, len3, true);
  dataView($memory).setUint32((arg1) + 0, ptr3, true);
  dataView($memory).setInt32((arg1) + 8, toUint32(v2_1), true);
  _debugLog('[Instruction::Return]', {
    funcName: '[method]counter.stats',
    paramCount: 0,
    async: false,
    postReturn: false
  });
  return;
}

function export_types$counter$static$merge(arg0, arg1) {
  var handle1 = arg0;
  var rsc0 = repTable.get(handle1).rep;
  var handle3 = arg1;
  var rsc2 = repTable.get(handle3).rep;
  _debugLog(' [Instruction::CallInterface] (sync, @ enter)');
  let ret;
  
  ret = Counter.merge(rsc0, rsc2);
  
  if (!(ret instanceof Counter)) {
    throw new TypeError('Resource error: Not a valid \"Counter\" resource.');
  }
  let handle4 = ret[symbolRscHandle];
  if (handle4=== undefined) {
    var localRep5= repCnt++;
    repTable.set(localRep5, { rep: ret, own: true });
    handle4 = $resource_types$new$counter(localRep5);
    ret[symbolRscHandle] = handle4;
    finalizationRegistry_export$types$counter.register(ret, handle4, ret);
  }
  
  _debugLog('[Instruction::Return]', {
    funcName: '[static]counter.merge',
    paramCount: 1,
    async: false,
    postReturn: false
  });
  return handle4;
}

function export_types$describe(arg0, arg1) {
  var handle1 = arg0;
  var rsc0 = repTable.get(handle1).rep;
  _debugLog(' [Instruction::CallInterface] (sync, @ enter)');
  let ret;
  
  ret = typesDescribe(rsc0);
  
  var encodeRes = _utf8AllocateAndEncode(ret, $realloc, $memory);
  var ptr2= encodeRes.ptr;
  var len2 = encodeRes.len;
  
  dataView($memory).setUint32((arg1) + 4, len2, true);
  dataView($memory).setUint32((arg1) + 0, ptr2, true);
  _debugLog('[Instruction::Return]', {
    funcName: 'describe',
    paramCount: 0,
    async: false,
    postReturn: false
  });
  return;
}

function export_types$logTo(arg0, arg1) {
  var handle1 = arg0;
  var rsc0 = repTable.get(handle1).rep;
  var handle3 = arg1;
  
  var rsc2 = new.target === import_logging$Logger ? this : Object.create(import_logging$Logger.prototype);
  Object.defineProperty(rsc2, symbolRscHandle, { writable: true, value: handle3});
  finalizationRegistry_import$logging$logger.register(rsc2, handle3, rsc2);
  curResourceBorrows.push({ rsc: rsc2, drop: $resource_import$logging$drop$logger });
  _debugLog(' [Instruction::CallInterface] (sync, @ enter)');
  let ret;
  
  const borrows4 = curResourceBorrows;
  curResourceBorrows= [];
  try {
    typesLogTo(rsc0, rsc2);
  } finally {
    for (const entry of borrows4) {
      const rsc = entry.rsc ?? entry;
      if (entry.drop) {
        if (rsc[symbolRscHandle]) {
          entry.drop(rsc[symbolRscHandle]);
        }
      }
      rsc[symbolRscHandle] = undefined;
    }
  }
  _debugLog('[Instruction::Return]', {
    funcName: 'log-to',
    paramCount: 0,
    async: false,
    postReturn: false
  });
  return;
}

function export_types$makeLogger(arg0, arg1) {
  var ptr0 = arg0 >>> 0;
  var len0 = arg1;
  var result0 = TEXT_DECODER_UTF8.decode(memoryView(Uint8Array, $memory, ptr0, len0));
  if (len0 !== 0) $dealloc(ptr0, len0, 1);
  _debugLog(' [Instruction::CallInterface] (sync, @ enter)');
  let ret;
  
  ret = typesMakeLogger(result0);
  
  var handle1 = ret[symbolRscHandle];
  finalizationRegistry_import$logging$logger.unregister(ret);
  _debugLog('[Instruction::Return]', {
    funcName: 'make-logger',
    paramCount: 1,
    async: false,
    postReturn: false
  });
  return handle1;
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
  
  let Counter, typesDescribe, typesLogTo, typesMakeLogger;
  let __sourceName = 'source module';
  export function bindExports($source_mod) {
    let __iface;
    __iface = getInterfaceExport($source_mod, 'types', 'example:counter/types');
    Counter = __iface.Counter;
    typesDescribe = __iface.describe;
    typesLogTo = __iface.logTo;
    typesMakeLogger = __iface.makeLogger;
    verifyInterfaceResource(Counter, 'example:counter/types', 'Counter', 'types');
    verifyInterfaceFn(typesDescribe, 'example:counter/types', 'describe', 'types');
    verifyInterfaceFn(typesLogTo, 'example:counter/types', 'logTo', 'types');
    verifyInterfaceFn(typesMakeLogger, 'example:counter/types', 'makeLogger', 'types');
  }
  