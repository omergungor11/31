import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

let connection;

export function database() {
  if (connection) return connection;
  const directory = process.env.TAPE_DATA_DIR || join(process.cwd(), ".tape-data");
  mkdirSync(directory, { recursive: true });
  const db = new DatabaseSync(join(directory, "tape.sqlite"));
  db.exec(`
    PRAGMA busy_timeout = 5000;
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS watchlists (
      id TEXT PRIMARY KEY,
      updated INTEGER NOT NULL,
      payload TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS votes (
      slug TEXT NOT NULL,
      voter TEXT NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('like', 'dislike')),
      PRIMARY KEY (slug, voter)
    );
  `);
  connection = db;
  return db;
}
