import init, { greet } from "/pkg/field_line_sim.js";
init().then(() => {
    greet("WebAssembly");
});