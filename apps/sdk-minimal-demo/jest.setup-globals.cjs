// engine.io-client@3.x captures globalThis.WebSocket at module load time.
// Node 22+ exposes a native WebSocket (via undici) that causes a recursive
// close/error loop in the old engine.io-client transport, leading to
// "Maximum call stack size exceeded". Removing it forces the fallback to
// the `ws` npm package which handles close/error correctly.
delete globalThis.WebSocket
