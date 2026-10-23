// A component implemented in JS (`../../../app.js`), compiled ahead of time by
// Static Hermes and run on the Hermes VM through JSI.
//
// main.rs generates the JS bindings and the core exports/imports in C++
// (bindings.cpp). The bindings reach linear memory and the core imports
// through the native `__wit_*` functions registered here.

#include "embedding.h"

#include <hermes/hermes.h>

#include <cstdio>
#include <cstring>
#include <memory>
#include <string>
#include <vector>

namespace jsi = facebook::jsi;
using facebook::hermes::HermesRuntime;
using facebook::hermes::makeHermesRuntime;

// the bundle of the bindings and app.js, compiled by shermes
extern "C" SHUnit *sh_export_app(void);

namespace {

// Created on the first export call and never destroyed, since a component
// instance has no shutdown hook.
HermesRuntime *runtime;
std::vector<jsi::Function> *callbacks;
// allocations made by JS lowering, freed once the host is done with them
std::vector<void *> tracked;

void *alloc_tracked(size_t size) {
  void *p = malloc(size ? size : 1);
  tracked.push_back(p);
  return p;
}

uint32_t addr(jsi::Runtime &rt, const jsi::Value &v) {
  return (uint32_t)(int64_t)v.asNumber();
}

/// Copies the bytes viewed by a typed array
std::vector<uint8_t> typed_array_bytes(jsi::Runtime &rt, const jsi::Value &v) {
  jsi::Object array = v.asObject(rt);
  size_t offset = (size_t)array.getProperty(rt, "byteOffset").asNumber();
  size_t length = (size_t)array.getProperty(rt, "byteLength").asNumber();
  jsi::ArrayBuffer buffer = array.getPropertyAsObject(rt, "buffer").getArrayBuffer(rt);
  const uint8_t *data = buffer.data(rt) + offset;
  return std::vector<uint8_t>(data, data + length);
}

/// A JSI ArrayBuffer backed by its own copy of linear memory
class Bytes : public jsi::MutableBuffer {
 public:
  explicit Bytes(size_t size) : data_(size) {}
  size_t size() const override { return data_.size(); }
  uint8_t *data() override { return data_.data(); }

 private:
  std::vector<uint8_t> data_;
};

using Native = jsi::Value (*)(jsi::Runtime &, const jsi::Value *, size_t);

jsi::Value wit_register(jsi::Runtime &rt, const jsi::Value *args, size_t) {
  size_t i = (size_t)args[0].asNumber();
  (*callbacks)[i] = args[1].asObject(rt).asFunction(rt);
  return jsi::Value::undefined();
}

jsi::Value wit_import(jsi::Runtime &rt, const jsi::Value *args, size_t count) {
  std::vector<double> a;
  for (size_t n = 1; n < count; n++)
    a.push_back(args[n].asNumber());
  return call_import((size_t)args[0].asNumber(), a.data());
}

jsi::Value wit_resource(jsi::Runtime &rt, const jsi::Value *args, size_t) {
  return call_resource((size_t)args[0].asNumber(), (int32_t)(int64_t)args[1].asNumber());
}

jsi::Value wit_alloc(jsi::Runtime &rt, const jsi::Value *args, size_t) {
  return (double)(uintptr_t)alloc_tracked(addr(rt, args[0]));
}

jsi::Value wit_free(jsi::Runtime &rt, const jsi::Value *args, size_t) {
  free((void *)(uintptr_t)addr(rt, args[0]));
  return jsi::Value::undefined();
}

template <typename T>
T load(uint32_t p) {
  T v;
  memcpy(&v, (const void *)(uintptr_t)p, sizeof(T));
  return v;
}

template <typename T>
void store(uint32_t p, T v) {
  memcpy((void *)(uintptr_t)p, &v, sizeof(T));
}

jsi::Value wit_load(jsi::Runtime &rt, const jsi::Value *args, size_t) {
  uint32_t p = addr(rt, args[1]);
  switch ((int)args[0].asNumber()) {
    case 0: return (double)load<int8_t>(p);
    case 1: return (double)load<uint8_t>(p);
    case 2: return (double)load<int16_t>(p);
    case 3: return (double)load<uint16_t>(p);
    case 4: return (double)load<int32_t>(p);
    case 5: return (double)load<uint32_t>(p);
    case 6: return (double)load<float>(p);
    default: return load<double>(p);
  }
}

jsi::Value wit_store(jsi::Runtime &rt, const jsi::Value *args, size_t) {
  uint32_t p = addr(rt, args[1]);
  double v = args[2].asNumber();
  switch ((int)args[0].asNumber()) {
    case 0: case 1: store<uint8_t>(p, (uint8_t)(int64_t)v); break;
    case 2: case 3: store<uint16_t>(p, (uint16_t)(int64_t)v); break;
    case 4: case 5: store<uint32_t>(p, (uint32_t)(int64_t)v); break;
    case 6: store<float>(p, (float)v); break;
    default: store<double>(p, v); break;
  }
  return jsi::Value::undefined();
}

jsi::Value wit_read(jsi::Runtime &rt, const jsi::Value *args, size_t) {
  uint32_t p = addr(rt, args[0]), n = addr(rt, args[1]);
  auto bytes = std::make_shared<Bytes>(n);
  if (n > 0)
    memcpy(bytes->data(), (const void *)(uintptr_t)p, n);
  return jsi::ArrayBuffer(rt, bytes);
}

jsi::Value wit_write(jsi::Runtime &rt, const jsi::Value *args, size_t) {
  std::vector<uint8_t> bytes = typed_array_bytes(rt, args[1]);
  memcpy((void *)(uintptr_t)addr(rt, args[0]), bytes.data(), bytes.size());
  return jsi::Value::undefined();
}

jsi::Value wit_utf8_decode(jsi::Runtime &rt, const jsi::Value *args, size_t) {
  std::vector<uint8_t> bytes = typed_array_bytes(rt, args[0]);
  return jsi::String::createFromUtf8(rt, bytes.data(), bytes.size());
}

jsi::Value wit_utf8_encode(jsi::Runtime &rt, const jsi::Value *args, size_t) {
  std::string s = args[0].toString(rt).utf8(rt);
  void *p = alloc_tracked(s.size());
  memcpy(p, s.data(), s.size());
  return jsi::Array::createWithElements(rt, (double)(uintptr_t)p, (double)s.size());
}

void init() {
  runtime = makeHermesRuntime().release();
  callbacks = new std::vector<jsi::Function>();
  jsi::Runtime &rt = *runtime;
  const std::pair<const char *, Native> natives[] = {
      {"__wit_register", wit_register},
      {"__wit_import", wit_import},
      {"__wit_resource", wit_resource},
      {"__wit_alloc", wit_alloc},
      {"__wit_free", wit_free},
      {"__wit_load", wit_load},
      {"__wit_store", wit_store},
      {"__wit_read", wit_read},
      {"__wit_write", wit_write},
      {"__wit_utf8_decode", wit_utf8_decode},
      {"__wit_utf8_encode", wit_utf8_encode},
  };
  for (const auto &native : natives) {
    Native f = native.second;
    auto id = jsi::PropNameID::forAscii(rt, native.first);
    auto host = [f](jsi::Runtime &rt, const jsi::Value &, const jsi::Value *args, size_t count) {
      return f(rt, args, count);
    };
    rt.global().setProperty(rt, id, jsi::Function::createFromHostFunction(rt, id, 0, host));
  }
  // jsi::Function has no default value, so the callbacks start as no-ops
  auto unbound = jsi::Function::createFromHostFunction(
      rt, jsi::PropNameID::forAscii(rt, "unbound"), 0,
      [](jsi::Runtime &, const jsi::Value &, const jsi::Value *, size_t) -> jsi::Value {
        throw std::runtime_error("export not bound");
      });
  for (size_t i = 0; i < EXPORT_COUNT; i++)
    callbacks->push_back(jsi::Value(rt, unbound).asObject(rt).asFunction(rt));
  // runs the top level of app.js, then binds its exports
  runtime->evaluateSHUnit(sh_export_app);
}

[[noreturn]] void fail(const char *what) {
  fprintf(stderr, "uncaught exception: %s\n", what);
  abort();
}

} // namespace

double call_export(size_t i, const double *args, size_t n) {
  try {
    if (!runtime)
      init();
    jsi::Runtime &rt = *runtime;
    std::vector<jsi::Value> values(args, args + n);
    jsi::Value r = (*callbacks)[i].call(rt, (const jsi::Value *)values.data(), values.size());
    return r.isNumber() ? r.getNumber() : 0;
  } catch (const jsi::JSError &e) {
    fail(e.getMessage().c_str());
  } catch (const std::exception &e) {
    fail(e.what());
  }
}

int32_t alloc_ret(size_t size) {
  return (int32_t)(uintptr_t)malloc(size ? size : 1);
}

void free_tracked() {
  for (void *p : tracked)
    free(p);
  tracked.clear();
}
