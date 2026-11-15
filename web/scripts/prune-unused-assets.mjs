// Vite still emits PGlite's 13 MB wasm/data files in production builds even when the
// offline demo code was tree-shaken out. Delete assets that no JS/CSS/HTML refers to.
import { readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const dir = "dist/assets";
const files = readdirSync(dir);
const texts = [...files.filter((f) => /\.(js|css)$/.test(f)).map((f) => readFileSync(join(dir, f), "utf8")), readFileSync("dist/index.html", "utf8")];
for (const f of files.filter((f) => /^postgres-.*\.(wasm|data)$/.test(f))) {
  if (!texts.some((t) => t.includes(f))) { rmSync(join(dir, f)); console.log("pruned unused asset", f); }
}
