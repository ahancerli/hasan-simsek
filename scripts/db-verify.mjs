// Canlı D1 şemasını uygulamanın beklediği şema ile karşılaştırır (kod → src/lib/db/tables.ts).
import { d1 } from "./_d1.mjs"

const base = ["id", "rank", "isActive", "createdAt"]
const EXPECT = {
	settings: [
		"company_name",
		"slogan",
		"working_hours",
		"phone_1",
		"email",
		"address",
		"about_us",
		"mission",
		"vision",
		"meta_description",
		"meta_keywords",
		"logo",
	],
	slides: ["title", "description", "button_caption", "button_url", "img_url", ...base],
	portfolios: [
		"title",
		"description",
		"url",
		"category_id",
		"client",
		"place",
		"finishedAt",
		"portfolio_url",
		...base,
	],
	portfolio_categories: ["title", "isActive"],
	portfolio_images: ["portfolio_id", "img_url", "isCover", ...base],
	references: ["title", "img_url", ...base],
	brands: ["title", "img_url", ...base],
	services: ["title", "img_url", ...base],
	products: ["title", ...base],
	product_images: ["product_id", "img_url", "isCover"],
	news: ["title", "news_type", "img_url", "video_url", ...base],
	courses: ["title", "event_date", "img_url", ...base],
	testimonials: ["title", "full_name", "company", "img_url", ...base],
	popups: ["title", "description", "page", "popup_uniq_id", "isActive"],
	galleries: ["title", "gallery_type", "url", "folder_name", ...base],
	images: ["gallery_id", "url", ...base],
	files: ["gallery_id", "url"],
	videos: ["gallery_id", "url", ...base],
	users: [
		"user_name",
		"full_name",
		"email",
		"password",
		"isActive",
		"role",
		"failed_attempts",
		"locked_until",
	],
	seo_meta: ["scope", "ref", "title", "description"],
	contact_messages: ["name", "email", "message"],
	audit_logs: ["action"],
	password_resets: ["token_hash", "expires_at"],
}

const IGNORE_TABLES = new Set(["_cf_KV"])
let bad = 0
for (const [t, cols] of Object.entries(EXPECT)) {
	const have = new Set((await d1(`PRAGMA table_info("${t}")`)).map((c) => c.name))
	if (!have.size) {
		console.log(`✗ ${t}: TABLO YOK`)
		bad++
		continue
	}
	const miss = cols.filter((c) => !have.has(c))
	console.log(miss.length ? `✗ ${t}: eksik → ${miss.join(", ")}` : `✓ ${t}`)
	if (miss.length) bad++
}

const expectedTables = new Set(Object.keys(EXPECT))
const allTables = (
	await d1(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`)
)
	.map((r) => r.name)
	.filter((name) => !IGNORE_TABLES.has(name))
const extra = allTables.filter((name) => !expectedTables.has(name))
if (extra.length) {
	console.log(`! Beklenmeyen tablolar: ${extra.join(", ")} (kullanım dışıysa temizlenebilir)`)
}

const legacy = await d1(`SELECT COUNT(*) AS c FROM users WHERE length(password)=32`).catch(() => [
	{ c: "?" },
])
console.log(`\nmd5 hash'li kullanıcı: ${legacy[0].c} (ilk girişte bcrypt'e yükseltilir)`)
console.log(
	bad
		? `\n${bad} sorun var. Önce 'npm run db:migrate' çalıştırın; kalanlar için şemayı kontrol edin.`
		: "\nŞema uyumlu.",
)
process.exit(bad ? 1 : 0)
