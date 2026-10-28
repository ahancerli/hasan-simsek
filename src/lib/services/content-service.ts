import "server-only"
import {
	settings,
	slides,
	portfolios,
	portfolioImages,
	portfolioCategories,
	references,
	brands,
	galleryImages,
	galleryVideos,
	popups,
	seoMeta,
	services,
	news,
	testimonials,
} from "@/lib/db/tables"
import { query } from "@/lib/db/d1"
import { siteImage, uploadUrl } from "@/lib/assets"

export type ProjectCardDto = {
	id: number
	title: string
	slug: string
	image: string
	hasImage: boolean
	category: string
	place: string
}

export const contentService = {
	async getSettings() {
		return (await settings.list({}, "id ASC", 1))[0] ?? null
	},

	async getSeo(scope: string, ref: string) {
		return seoMeta.get({ scope, ref })
	},

	async getSlides() {
		return slides.list({ isActive: 1 }, "rank ASC")
	},

	async getCategories() {
		return portfolioCategories.list({ isActive: 1 }, "id ASC")
	},

	async getPortfolios(categoryId?: number) {
		return portfolios.list(
			categoryId ? { isActive: 1, category_id: categoryId } : { isActive: 1 },
			"rank ASC",
		)
	},

	async getPortfolioBySlug(url: string) {
		return portfolios.get({ isActive: 1, url })
	},

	async getPortfolioImages(portfolioId: number) {
		return portfolioImages.list({ isActive: 1, portfolio_id: portfolioId }, "rank ASC")
	},

	async getCoverMap() {
		const r = await query<{ portfolio_id: number; img_url: string }>(
			`SELECT "portfolio_id", "img_url" FROM "portfolio_images" WHERE "isCover" = ? AND "isActive" = ?`,
			[1, 1],
		)
		return Object.fromEntries(r.rows.map((x) => [String(x.portfolio_id), x.img_url])) as Record<
			string,
			string
		>
	},

	async getReferences() {
		return references.list({ isActive: 1 }, "rank ASC")
	},

	async getBrands() {
		return brands.list({ isActive: 1 }, "rank ASC")
	},

	async getServices() {
		return services.list({ isActive: 1 }, "rank ASC")
	},

	async getNews() {
		return news.list({ isActive: 1 }, "rank ASC")
	},

	async getTestimonials() {
		return testimonials.list({ isActive: 1 }, "rank ASC")
	},

	async getGalleryImages() {
		return galleryImages.list({ isActive: 1 }, "rank ASC")
	},

	async getGalleryVideos() {
		return galleryVideos.list({ isActive: 1 }, "rank ASC")
	},

	async getPopup(page: string) {
		return popups.get({ isActive: 1, page })
	},

	async getProjectCards(categoryId?: number): Promise<ProjectCardDto[]> {
		const [rows, covers, cats] = await Promise.all([
			this.getPortfolios(categoryId),
			this.getCoverMap(),
			this.getCategories(),
		])
		const catName = new Map(cats.map((c) => [Number(c.id), String(c.title)]))
		return rows.map((r) => {
			const cover = covers[String(r.id)]
			return {
				id: r.id,
				title: String(r.title ?? ""),
				slug: String(r.url ?? ""),
				image: cover ? uploadUrl("portfolios_v", cover) : siteImage("hasan-simsek.png"),
				hasImage: !!cover,
				category: catName.get(Number(r.category_id)) ?? "Proje",
				place: String(r.place ?? ""),
			}
		})
	},
}
