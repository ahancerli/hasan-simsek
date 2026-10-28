import { promises as fs } from "node:fs"
import path from "node:path"
import sharp from "sharp"

const ROOT = path.resolve(process.cwd(), "public/assets/uploads")
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp"])

async function walk(dir) {
	const out = []
	const entries = await fs.readdir(dir, { withFileTypes: true })
	for (const e of entries) {
		const full = path.join(dir, e.name)
		if (e.isDirectory()) out.push(...(await walk(full)))
		else if (e.isFile() && EXT.has(path.extname(e.name).toLowerCase())) out.push(full)
	}
	return out
}

function encoder(ext) {
	if (ext === ".png") {
		return (img) => img.png({ compressionLevel: 9, palette: true, quality: 80, effort: 10 })
	}
	if (ext === ".webp") {
		return (img) => img.webp({ quality: 78, effort: 6 })
	}
	return (img) => img.jpeg({ quality: 78, mozjpeg: true, progressive: true })
}

function kb(n) {
	return `${(n / 1024).toFixed(1)} KB`
}

async function optimizeFile(file) {
	const ext = path.extname(file).toLowerCase()
	const input = await fs.readFile(file)
	const before = input.byteLength

	let output
	try {
		output = await encoder(ext)(sharp(input).rotate()).toBuffer()
	} catch {
		return { changed: false, before, after: before }
	}

	const after = output.byteLength
	if (after >= before) return { changed: false, before, after }

	await fs.writeFile(file, output)
	return { changed: true, before, after }
}

async function main() {
	try {
		await fs.access(ROOT)
	} catch {
		console.log(`Upload klasoru bulunamadi: ${ROOT}`)
		process.exit(0)
	}

	const files = await walk(ROOT)
	if (!files.length) {
		console.log("Optimize edilecek gorsel bulunamadi.")
		return
	}

	let changed = 0
	let totalBefore = 0
	let totalAfter = 0

	for (const file of files) {
		const res = await optimizeFile(file)
		totalBefore += res.before
		totalAfter += res.changed ? res.after : res.before
		if (res.changed) {
			changed += 1
			const saved = res.before - res.after
			const rel = path.relative(process.cwd(), file)
			console.log(`✓ ${rel} (${kb(res.before)} -> ${kb(res.after)}, -${kb(saved)})`)
		}
	}

	const saved = totalBefore - totalAfter
	const ratio = totalBefore ? ((saved / totalBefore) * 100).toFixed(2) : "0.00"
	console.log(`\nToplam dosya: ${files.length}`)
	console.log(`Optimize edilen: ${changed}`)
	console.log(`Kazanilan alan: ${kb(saved)} (%${ratio})`)
}

await main()
