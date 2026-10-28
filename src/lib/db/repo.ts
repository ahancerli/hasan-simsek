import "server-only";
import { ident, query, type SqlValue, DbError } from "./d1";

/**
 * Genel amaçlı, parametreli repository.
 * - Kolon adları kayıt defterindeki beyaz listeden gelir (kullanıcı girdisi asla tanımlayıcı olamaz).
 * - Değerler daima `?` ile bağlanır.
 */
export type Row = Record<string, unknown> & { id: number };
export type Where = Record<string, SqlValue>;

export type TableDef = {
  table: string;
  /** Yazılabilir kolonlar (id hariç) */
  columns: readonly string[];
};

function whereClause(where: Where): { sql: string; params: SqlValue[] } {
  const keys = Object.keys(where);
  if (!keys.length) return { sql: "", params: [] };
  return {
    sql: " WHERE " + keys.map((k) => `${ident(k)} = ?`).join(" AND "),
    params: keys.map((k) => where[k]),
  };
}

const ORDER = /^[A-Za-z_][A-Za-z0-9_]*( (ASC|DESC))?$/i;

export function repo(def: TableDef) {
  const t = ident(def.table);
  const allowed = new Set(def.columns);

  const pick = (data: Record<string, unknown>) => {
    const out: Record<string, SqlValue> = {};
    for (const [k, v] of Object.entries(data)) {
      if (!allowed.has(k)) continue; // mass-assignment koruması
      out[k] = v === undefined ? null : (v as SqlValue);
    }
    return out;
  };

  return {
    async list(where: Where = {}, order = "id ASC", limit?: number): Promise<Row[]> {
      if (!ORDER.test(order)) throw new DbError("Geçersiz sıralama");
      const [col, dir = "ASC"] = order.split(" ");
      const w = whereClause(where);
      const lim = limit ? ` LIMIT ${Math.max(1, Math.min(1000, Math.trunc(limit)))}` : "";
      const r = await query<Row>(`SELECT * FROM ${t}${w.sql} ORDER BY ${ident(col)} ${dir.toUpperCase()}${lim}`, w.params);
      return r.rows;
    },
    async get(where: Where): Promise<Row | null> {
      const w = whereClause(where);
      const r = await query<Row>(`SELECT * FROM ${t}${w.sql} LIMIT 1`, w.params);
      return r.rows[0] ?? null;
    },
    async count(where: Where = {}): Promise<number> {
      const w = whereClause(where);
      const r = await query<{ c: number }>(`SELECT COUNT(*) AS c FROM ${t}${w.sql}`, w.params);
      return Number(r.rows[0]?.c ?? 0);
    },
    async insert(data: Record<string, unknown>): Promise<number | null> {
      const d = pick(data);
      const keys = Object.keys(d);
      if (!keys.length) throw new DbError("Boş kayıt");
      const r = await query(
        `INSERT INTO ${t} (${keys.map(ident).join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`,
        keys.map((k) => d[k]),
      );
      return r.lastRowId;
    },
    async update(id: number, data: Record<string, unknown>): Promise<void> {
      const d = pick(data);
      const keys = Object.keys(d);
      if (!keys.length) return;
      await query(`UPDATE ${t} SET ${keys.map((k) => `${ident(k)} = ?`).join(", ")} WHERE "id" = ?`, [
        ...keys.map((k) => d[k]),
        id,
      ]);
    },
    async remove(id: number): Promise<void> {
      await query(`DELETE FROM ${t} WHERE "id" = ?`, [id]);
    },
    /** Sürükle-bırak sıralama: her id için rank güncellenir (parametreli). */
    async setRanks(ids: number[]): Promise<void> {
      for (let i = 0; i < ids.length; i++) {
        await query(`UPDATE ${t} SET "rank" = ? WHERE "id" = ?`, [i, ids[i]]);
      }
    },
  };
}
