import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { ArrowRight, Award, HardHat, Ruler } from "lucide-react"
import { HeroSlider, type SlideItem } from "@/components/site/HeroSlider"
import { ProjectTabs } from "@/components/site/ProjectTabs"
import { loadProjects } from "@/components/site/ProjectList"
import { PopupSlot } from "@/components/site/PopupSlot"
import { JsonLd } from "@/components/site/JsonLd"
import { getSettings, getSlides } from "@/lib/data"
import { uploadUrl, siteImage } from "@/lib/assets"
import { buildMetadata } from "@/lib/seo"
import { PROJECT_STATUS } from "@/lib/site-config"
import { stripHtml } from "@/lib/security/sanitize"
import { truncate } from "@/lib/utils"
import { env } from "@/lib/env"

export const generateMetadata = (): Promise<Metadata> =>
	buildMetadata({ scope: "page", ref: "home", path: "/" })

export default async function HomePage() {
	const [slides, settings, all] = await Promise.all([getSlides(), getSettings(), loadProjects()])

	const items: SlideItem[] = slides.map((s) => ({
		id: s.id,
		image: uploadUrl("slides_v", s.img_url),
		title: stripHtml(s.title),
		text: truncate(stripHtml(s.description), 200),
		buttonText: Number(s.allowButton ?? 1) === 0 ? "" : stripHtml(s.button_caption),
		buttonUrl: String(s.button_url ?? ""),
	}))

	const catIds = PROJECT_STATUS

	const about = truncate(stripHtml(settings?.about_us), 380)
	const company = String(settings?.company_name ?? "Hasan Şimşek İnşaat")

	return (
		<>
			<JsonLd
				data={{
					"@context": "https://schema.org",
					"@type": "GeneralContractor",
					name: company,
					url: env().APP_URL,
					telephone: String(settings?.phone_1 ?? ""),
					email: String(settings?.email ?? ""),
					address: String(settings?.address ?? ""),
					sameAs: [
						settings?.facebook,
						settings?.twitter,
						settings?.instagram,
						settings?.linkedin,
					].filter(Boolean),
				}}
			/>
			<HeroSlider slides={items} />

			{/* Hakkımızda */}
			<section className="relative bg-ink py-16 text-white md:py-24">
				<div className="container grid items-center gap-12 lg:grid-cols-2">
					<div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
						<Image
							src={siteImage("resource/feature-image-1.jpg")}
							alt={company}
							fill
							sizes="(min-width:1024px) 50vw, 100vw"
							className="object-cover"
						/>
					</div>
					<div>
						<h2 className="section-title !text-white">Şirketimiz Hakkında</h2>
						<p className="text-lg leading-relaxed text-white/80">{about}</p>
						<ul className="my-8 grid grid-cols-3 gap-4 text-center">
							{[
								{ Icon: Award, a: "Kaliteli", b: "İş" },
								{ Icon: HardHat, a: "Güzel", b: "İşçilik" },
								{ Icon: Ruler, a: "Deneyimli", b: "Mühendislik" },
							].map(({ Icon, a, b }) => (
								<li key={a} className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
									<Icon className="mx-auto mb-2 text-brand" size={30} />
									<p className="text-sm font-semibold leading-tight">
										{a}
										<br />
										{b}
									</p>
								</li>
							))}
						</ul>
						<Link href="/hakkimizda" className="btn btn-brand">
							Devamını Oku <ArrowRight size={16} />
						</Link>
					</div>
				</div>
			</section>

			{/* Projeler */}
			<section className="bg-ink-100 py-16 md:py-24">
				<div className="container">
					<div className="mb-2 flex items-end justify-between gap-4">
						<h2 className="section-title !mb-6">Projelerimiz</h2>
						<Link
							href="/proje-listesi"
							className="mb-6 hidden items-center gap-1 text-sm font-bold text-brand-700 hover:underline sm:flex"
						>
							Tümünü gör <ArrowRight size={16} />
						</Link>
					</div>
					<ProjectTabs
						tabs={[
							{ key: "all", label: "Tümü", items: all },
							{ key: "planned", label: "Planlanan", categoryId: catIds.planned.categoryId },
							{ key: "ongoing", label: "Devam Eden", categoryId: catIds.ongoing.categoryId },
							{ key: "completed", label: "Tamamlanan", categoryId: catIds.completed.categoryId },
						]}
					/>
				</div>
			</section>

			{/* CTA */}
			<section className="relative isolate overflow-hidden bg-brand py-16">
				<div className="container flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
					<h2 className="max-w-2xl text-2xl font-extrabold md:text-3xl">
						Bize bir öneriniz mi var? <span className="text-white">Her türlü görüş</span> ve
						önerileriniz için yazınız!
					</h2>
					<Link href="/iletisim" className="btn btn-dark shrink-0">
						Bize Yazın <ArrowRight size={16} />
					</Link>
				</div>
			</section>
			<PopupSlot page="home_v" />
		</>
	)
}
