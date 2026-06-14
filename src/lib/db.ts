import { getRequestContext } from "@cloudflare/next-on-pages";

export function getDB() {
  const { env } = getRequestContext();
  return env.DB;
}

export async function query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  const db = getDB();
  const result = await db.prepare(sql).bind(...params).all();
  return result.results as T[];
}

export async function queryOne<T = unknown>(sql: string, params: unknown[] = []): Promise<T | null> {
  const db = getDB();
  const result = await db.prepare(sql).bind(...params).first();
  return result as T | null;
}

export async function execute(sql: string, params: unknown[] = []) {
  const db = getDB();
  return await db.prepare(sql).bind(...params).run();
}
