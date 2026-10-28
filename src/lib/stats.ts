import "server-only";
import { query } from "@/lib/db/d1";

const TABLES = ["portfolios", "slides", "images", "videos", "references", "contact_messages"] as const;

/** Dashboard sayıları (yalnızca sunucu bileşeninden çağrılır; client'a action olarak açılmaz). */
export async function dashboardCounts(): Promise<Record<(typeof TABLES)[number], number>> {
  const out = {} as Record<(typeof TABLES)[number], number>;
  await Promise.all(
    TABLES.map(async (t) => {
      try {
        const r = await query<{ c: number }>(`SELECT COUNT(*) AS c FROM "${t}"`);
        out[t] = Number(r.rows[0]?.c ?? 0);
      } catch {
        out[t] = 0; // tablo henüz yoksa (migration öncesi) panel yine açılır
      }
    }),
  );
  return out;
}
