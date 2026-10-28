import { NextResponse } from "next/server"
import { contentService } from "@/lib/services/content-service"

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url)
		const raw = searchParams.get("categoryId")
		const categoryId = raw ? Number(raw) : undefined

		if (raw && (!Number.isInteger(categoryId) || Number(categoryId) <= 0)) {
			return NextResponse.json({ error: "Geçersiz categoryId" }, { status: 400 })
		}

		const items = await contentService.getProjectCards(categoryId)
		return NextResponse.json(
			{ items },
			{ headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
		)
	} catch {
		return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
	}
}
