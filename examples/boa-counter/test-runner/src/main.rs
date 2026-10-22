use anyhow::{Result, ensure};
use wasmtime::component::{Component, HasSelf, Linker, Resource, ResourceTable};
use wasmtime::{Config, Engine, Store};
use wasmtime_wasi::{WasiCtx, WasiCtxView, WasiView};

wasmtime::component::bindgen!({
    path: "../wit",
    world: "app",
    exports: { default: async },
    with: { "example:counter/logging.logger": Logger },
});

pub struct Logger {
    prefix: String,
}

struct State {
    ctx: WasiCtx,
    table: ResourceTable,
    lines: Vec<String>,
    loggers_dropped: u32,
}

impl WasiView for State {
    fn ctx(&mut self) -> WasiCtxView<'_> {
        WasiCtxView { ctx: &mut self.ctx, table: &mut self.table }
    }
}

impl example::counter::logging::Host for State {}

impl example::counter::logging::HostLogger for State {
    fn new(&mut self, prefix: String) -> Resource<Logger> {
        self.table.push(Logger { prefix }).unwrap()
    }

    fn log(&mut self, logger: Resource<Logger>, msg: String) {
        let line = format!("{} {msg}", self.table.get(&logger).unwrap().prefix);
        println!("host log: {line}");
        self.lines.push(line);
    }

    fn drop(&mut self, logger: Resource<Logger>) -> wasmtime::Result<()> {
        self.table.delete(logger)?;
        self.loggers_dropped += 1;
        Ok(())
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    let path = std::env::args().nth(1).unwrap_or("../out/component.wasm".into());
    let mut config = Config::new();
    let engine = Engine::new(&config)?;
    let component = Component::from_file(&engine, &path)?;

    let mut linker = Linker::<State>::new(&engine);
    wasmtime_wasi::p2::add_to_linker_async(&mut linker)?;
    example::counter::logging::add_to_linker::<_, HasSelf<_>>(&mut linker, |s| s)?;

    let state = State {
        ctx: WasiCtx::builder().inherit_stdio().build(),
        table: ResourceTable::new(),
        lines: Vec::new(),
        loggers_dropped: 0,
    };
    let mut store = Store::new(&engine, state);
    let app = App::instantiate_async(&mut store, &component, &linker).await?;
    let types = app.example_counter_types();
    let counter = types.counter();

    // exported resource: constructor, methods, static, borrows, drop
    let a = counter.call_constructor(&mut store, "a", 1).await?;
    // the first call ran the JS top level, which disposed its temporary logger
    ensure!(store.data().loggers_dropped == 1);
    let b = counter.call_constructor(&mut store, "b", 10).await?;
    ensure!(counter.call_inc(&mut store, a, 4).await? == 5);
    ensure!(counter.call_inc(&mut store, b, 2).await? == 12);
    let stats = counter.call_stats(&mut store, a).await?;
    println!("stats(a) = {stats:?}");
    ensure!(stats.name == "a" && stats.value == 5);
    let ab = counter.call_merge(&mut store, a, b).await?;
    let desc = types.call_describe(&mut store, ab).await?;
    println!("describe(merge(a, b)) = {desc:?}");
    ensure!(desc == "a+b = 17 ✓");

    // imported resource: host-owned borrow passed in, guest-created own returned
    let host_logger = store.data_mut().table.push(Logger { prefix: "[host]".into() })?;
    let borrowed = Resource::<Logger>::new_borrow(host_logger.rep());
    types.call_log_to(&mut store, ab, borrowed).await?;
    let made = types.call_make_logger(&mut store, "[made-by-js]").await?;
    let made_prefix = &store.data().table.get(&made)?.prefix;
    ensure!(made_prefix == "[made-by-js]");

    for r in [a, b, ab] {
        r.resource_drop_async(&mut store).await?;
    }

    let lines = &store.data().lines;
    ensure!(lines[0] == "[js] app initialized");
    ensure!(lines[1] == "[tmp] disposed right after this");
    ensure!(lines.contains(&"[host] a+b is at 17".to_string()));
    println!("all checks passed");
    Ok(())
}
