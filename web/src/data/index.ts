import { createSupabaseApi } from "./supabase";
import type { DataApi } from "./types";

const env = import.meta.env;
// Written out in full on purpose: Vite only folds `import.meta.env.X` when it is not aliased.
const demo = import.meta.env.VITE_DEMO === "1";

export const configError =
  demo || (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY)
    ? null
    : "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see web/.env.example), or run with VITE_DEMO=1.";

// The demo backend (an in-browser Postgres, ~13 MB) is a separate chunk: when VITE_DEMO
// is not "1" this branch is removed at build time and the chunk is never shipped.
export const api: DataApi | null = configError
  ? null
  : demo
    ? (await import("./demo")).createDemoApi()
    : createSupabaseApi(env.VITE_SUPABASE_URL as string, env.VITE_SUPABASE_ANON_KEY as string);

export * from "./types";
