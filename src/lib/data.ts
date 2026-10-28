import "server-only"
import { unstable_cache } from "next/cache"
import { CONTENT_TAG } from "@/lib/site-config"
import { contentService } from "@/lib/services/content-service"

/**
 * Site (public) veri katmanı. Her okuma:
 *  - parametreli sorgu (repo)
 *  - yalnızca isActive=1 kayıtlar
 *  - etiketli cache (admin yazınca revalidateTag("content") ile anında yenilenir)
 */
const cached = <A extends unknown[], R>(key: string, fn: (...a: A) => Promise<R>) =>
	unstable_cache(fn, [key], { tags: [CONTENT_TAG], revalidate: 300 })

export const getSettings = cached("settings", () => contentService.getSettings())

export const getSeo = cached("seo", (scope: string, ref: string) =>
	contentService.getSeo(scope, ref),
)

export const getSlides = cached("slides", () => contentService.getSlides())

export const getCategories = cached("categories", () => contentService.getCategories())

export const getPortfolios = cached("portfolios", (categoryId?: number) =>
	contentService.getPortfolios(categoryId),
)

export const getPortfolioBySlug = cached("portfolio-slug", (url: string) =>
	contentService.getPortfolioBySlug(url),
)

export const getPortfolioImages = cached("portfolio-images", (portfolioId: number) =>
	contentService.getPortfolioImages(portfolioId),
)

/** N+1 yerine tek sorguda tüm kapak görselleri: { [portfolio_id]: img_url } */
export const getCoverMap = cached("cover-map", () => contentService.getCoverMap())

export const getReferences = cached("references", () => contentService.getReferences())
export const getBrands = cached("brands", () => contentService.getBrands())
export const getServices = cached("services", () => contentService.getServices())
export const getNews = cached("news", () => contentService.getNews())
export const getTestimonials = cached("testimonials", () => contentService.getTestimonials())
export const getGalleryImages = cached("gallery-images", () => contentService.getGalleryImages())
export const getGalleryVideos = cached("gallery-videos", () => contentService.getGalleryVideos())
export const getPopup = cached("popup", (page: string) => contentService.getPopup(page))
