//! Intrinsics that represent helpers that should be used from JS code

use crate::{intrinsics::RenderIntrinsicsArgs, source::Source};

/// This enum contains intrinsics that function as JS helpers
///
/// For example, intrinsics in this enum may create global JS variables,
/// polyfills, or perform commonly used JS functionality.
#[derive(Debug, Copy, Clone, Ord, PartialOrd, Eq, PartialEq)]
pub enum JsHelperIntrinsic {
    /// A Helper function that is simply an empty function
    EmptyFunc,

    /// A helper function that creates a JS `DataView` from a given memory index
    DataView,

    // FORK(js-guest-bindgen): the two helpers below are new. With `DataView`,
    // generated code reads and writes linear memory through them, so an
    // embedding whose engine cannot view memory as an `ArrayBuffer` can
    // provide its own versions
    /// A helper function that creates a typed array of a given type over a range of memory
    MemoryView,

    /// A helper function that copies the bytes of a typed array into memory
    MemoryWrite,
}

impl JsHelperIntrinsic {
    /// Retrieve global names for
    pub fn get_global_names() -> impl IntoIterator<Item = &'static str> {
        // FORK(js-guest-bindgen): added memoryView and memoryWrite
        ["emptyFunc", "dataView", "memoryView", "memoryWrite"]
    }

    /// Get the name for the intrinsic
    pub fn name(&self) -> &'static str {
        match self {
            Self::EmptyFunc => "emptyFunc",
            Self::DataView => "dataView",
            // FORK(js-guest-bindgen)
            Self::MemoryView => "memoryView",
            Self::MemoryWrite => "memoryWrite",
        }
    }

    /// Render an intrinsic to a string
    pub fn render(&self, output: &mut Source, _args: &RenderIntrinsicsArgs) {
        match self {
            Self::EmptyFunc => output.push_str("
                const emptyFunc = () => {};
            "),
            Self::DataView => output.push_str("
                let dv = new DataView(new ArrayBuffer());
                const dataView = mem => dv.buffer === mem.buffer ? dv : dv = new DataView(mem.buffer);
            "),
            // FORK(js-guest-bindgen)
            Self::MemoryView => output.push_str("
                const memoryView = (ty, mem, ptr, len) => new ty(mem.buffer, ptr, len);
            "),
            Self::MemoryWrite => output.push_str("
                const memoryWrite = (mem, ptr, bytes) => new Uint8Array(mem.buffer, ptr, bytes.byteLength).set(bytes);
            "),
        }
    }
}
