import "server-only"
import { env, requireEnvString } from "@/lib/env"
import { logError } from "@/lib/logger"

/**
 * Cloudflare D1 REST istemcisi.
 * Local ve prod AYNI veritabanına buradan gider (tek env, tek DB).
 * Tüm değerler `params` ile bağlanır (prepared statement) → SQL injection yok.
 */
export class DbError extends Error {
	constructor(message = "Veritabanı hatası") {
		super(message)
		this.name = "DbError"
	}
}

type D1Response<T> = {
	success: boolean
	errors?: { code: number; message: string }[]
	result?: { results: T[]; success: boolean; meta?: { last_row_id?: number; changes?: number } }[]
}

export type SqlValue = string | number | null

export type QueryResult<T> = { rows: T[]; lastRowId: number | null; changes: number }

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/
/** Tablo/kolon adı yalnızca kayıt defterinden gelir; yine de savunma amaçlı doğrularız. */
export function ident(name: string): string {
	if (!IDENT.test(name)) throw new DbError("Geçersiz tanımlayıcı")
	return `"${name}"`
}

export async function query<T = Record<string, unknown>>(
	sql: string,
	params: SqlValue[] = [],
): Promise<QueryResult<T>> {
	const e = env()
	const accountId = requireEnvString("CLOUDFLARE_ACCOUNT_ID")
	const dbId = requireEnvString("CLOUDFLARE_D1_DATABASE_ID")
	const apiToken = requireEnvString("CLOUDFLARE_API_TOKEN")
	const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`

	let res: Response
	try {
		res = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ sql, params }),
			cache: "no-store",
			signal: AbortSignal.timeout(15_000),
		})
	} catch (err) {
		logError("d1.network", err)
		throw new DbError()
	}

	let json: D1Response<T>
	try {
		json = (await res.json()) as D1Response<T>
	} catch (err) {
		logError("d1.parse", err, { status: res.status })
		throw new DbError()
	}

	if (!res.ok || !json.success || !json.result?.[0]?.success) {
		// Ayrıntı yalnızca sunucu logunda; istemciye jenerik hata gider.
		logError(
			"d1.query",
			new Error(json.errors?.map((x) => x.message).join("; ") || `HTTP ${res.status}`),
			{
				sqlHead: sql.slice(0, 60),
			},
		)
		throw new DbError()
	}

	const r = json.result[0]
	return {
		rows: r.results ?? [],
		lastRowId: r.meta?.last_row_id ?? null,
		changes: r.meta?.changes ?? 0,
	}
}
