// Applies every migration, in order, to a test database.
// The realtime migration is skipped: it configures a Supabase-only publication that plain Postgres does not have.
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("../migrations/", import.meta.url);

export const migrationFiles = () =>
  readdirSync(dir).filter((f) => f.endsWith(".sql") && !/realtime/i.test(f)).sort();

/** Run all migrations on `db`. Pass `{ grantAfterInit }` to run a statement right after the first one (some tests need it). */
export async function applyMigrations(db, { afterFirst } = {}) {
  const files = migrationFiles();
  for (let i = 0; i < files.length; i++) {
    await db.exec(readFileSync(new URL(files[i], dir), "utf8"));
    if (i === 0 && afterFirst) await db.exec(afterFirst);
  }
  return files;
}
