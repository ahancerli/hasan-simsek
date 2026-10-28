import { NextResponse } from "next/server"
import { contentService } from "@/lib/services/content-service"

const RESOURCES = new Set([
	"settings",
	"slides",
	"categories",
	"references",
	"brands",
	"services",
	"news",
	"testimonials",
	"gallery-images",
	"gallery-videos",
])

export async function GET(req: Request, { params }: { params: Promise<{ resource: string }> }) {
	try {
		const { resource } = await params
		if (!RESOURCES.has(resource)) {
			return NextResponse.json({ error: "Kaynak bulunamadı" }, { status: 404 })
		}

		const data =
			resource === "settings"
				? await contentService.getSettings()
				: resource === "slides"
					? await contentService.getSlides()
					: resource === "categories"
						? await contentService.getCategories()
						: resource === "references"
							? await contentService.getReferences()
							: resource === "brands"
								? await contentService.getBrands()
								: resource === "services"
									? await contentService.getServices()
									: resource === "news"
										? await contentService.getNews()
										: resource === "testimonials"
											? await contentService.getTestimonials()
											: resource === "gallery-images"
												? await contentService.getGalleryImages()
												: await contentService.getGalleryVideos()

		return NextResponse.json(
			{ data },
			{ headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
		)
	} catch {
		return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
	}
}
