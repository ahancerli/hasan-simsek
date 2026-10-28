import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { CalendarDays, MapPin, User, Tag } from "lucide-react"
import { PageTitle } from "@/components/site/PageTitle"
import { RichText } from "@/components/site/RichText"
import { Lightbox } from "@/components/site/Lightbox"
import { JsonLd } from "@/components/site/JsonLd"
import { getPortfolioBySlug, getPortfolioImages, getCategories } from "@/lib/data"
import { siteImage, uploadUrl } from "@/lib/assets"
import { buildMetadata } from "@/lib/seo"
import { formatDate } from "@/lib/utils"
import { stripHtml } from "@/lib/security/sanitize"
import { env } from "@/lib/env"

type Props = { params: Promise<{ slug: string }> }
const SLUG = /^[a-z0-9-]{1,160}$/

async function load(slug: string) {
	if (!SLUG.test(slug)) return null
	const p = await getPortfolioBySlug(slug)
	if (!p) return null
	return { p, images: await getPortfolioImages(p.id) }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params
	const d = await load(slug)
	if (!d) return { title: "Proje bulunamadı", robots: { index: false } }
	const cover = d.images.find((i) => Number(i.isCover) === 1) ?? d.images[0]
	const fallback = siteImage("hasan-simsek.png")
	return buildMetadata({
		scope: "portfolio",
		ref: String(d.p.id),
		path: `/proje-detay/${slug}`,
		fallbackTitle: String(d.p.title),
		fallbackDescription: stripHtml(d.p.description),
		fallbackImage: cover ? uploadUrl("portfolios_v", cover.img_url) : fallback,
	})
}

export default async function ProjectDetail({ params }: Props) {
	const { slug } = await params
	const d = await load(slug)
	if (!d) notFound()
	const { p, images } = d
	const cats = await getCategories()
	const category =
		cats.find((c) => Number(c.id) === Number(p.category_id))?.title ?? "Planlanan Proje"
	const cover = images.find((i) => Number(i.isCover) === 1) ?? images[0]
	const fallback = siteImage("hasan-simsek.png")
	const info = [
		{ Icon: User, k: "Müşteri", v: String(p.client ?? "") },
		{ Icon: MapPin, k: "Yer", v: String(p.place ?? "") },
		{ Icon: Tag, k: "Kategori", v: String(category) },
		{ Icon: CalendarDays, k: "Bitiş Tarihi", v: formatDate(p.finishedAt) },
	].filter((x) => x.v)

	return (
		<>
			<JsonLd
				data={{
					"@context": "https://schema.org",
					"@type": "CreativeWork",
					name: String(p.title),
					url: `${env().APP_URL}/proje-detay/${slug}`,
					image: cover ? uploadUrl("portfolios_v", cover.img_url) : fallback,
					locationCreated: String(p.place ?? ""),
				}}
			/>
			<PageTitle
				title={String(p.title)}
				crumbs={[{ label: "Projelerimiz", href: "/proje-listesi" }, { label: String(p.title) }]}
			/>
			<section className="py-16 md:py-24">
				<div className="container grid gap-12 lg:grid-cols-3">
					<div className="lg:col-span-2">
						<div className="relative mb-8 aspect-[16/10] overflow-hidden rounded-2xl shadow-card">
							<Image
								src={cover ? uploadUrl("portfolios_v", cover.img_url) : fallback}
								alt={String(p.title)}
								fill
								priority
								sizes="(min-width:1024px) 66vw, 100vw"
								className={cover ? "object-cover" : "object-contain bg-white p-12"}
							/>
						</div>
						<RichText html={p.description} />
					</div>
					<aside className="h-fit rounded-2xl bg-ink p-7 text-white lg:sticky lg:top-24">
						<h2 className="mb-5 text-xl font-bold text-white">Proje Bilgileri</h2>
						<ul className="divide-y divide-white/10">
							{info.map(({ Icon, k, v }) => (
								<li key={k} className="flex items-center justify-between gap-4 py-3 text-sm">
									<span className="flex items-center gap-2 text-white/70">
										<Icon size={16} className="text-brand" />
										{k}
									</span>
									<span className="text-right font-semibold">{v}</span>
								</li>
							))}
						</ul>
					</aside>
				</div>
			</section>
			{images.length > 0 && (
				<section className="bg-ink-100 py-16">
					<div className="container">
						<h2 className="section-title">Projenin Diğer Resimleri</h2>
						<Lightbox
							images={images.map((i, n) => ({
								src: uploadUrl("portfolios_v", i.img_url),
								alt: `${p.title} – ${n + 1}`,
							}))}
							columns="sm:grid-cols-2 lg:grid-cols-4"
						/>
					</div>
				</section>
			)}
		</>
	)
}
