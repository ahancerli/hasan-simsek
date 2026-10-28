import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

export type ProjectItem = {
	id: number
	title: string
	slug: string
	image: string
	hasImage: boolean
	category: string
	place: string
}

export function ProjectCard({ p, priority = false }: { p: ProjectItem; priority?: boolean }) {
	return (
		<article className="group overflow-hidden rounded-xl bg-white shadow-card ring-1 ring-black/5 transition hover:-translate-y-1">
			<Link
				href={`/proje-detay/${p.slug}`}
				className="relative block aspect-[4/3] overflow-hidden bg-ink-100"
			>
				<Image
					src={p.image}
					alt={p.title}
					fill
					priority={priority}
					sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
					className={cn(
						"transition duration-700",
						p.hasImage ? "object-cover group-hover:scale-110" : "object-contain bg-white p-8",
					)}
				/>
				<span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
				<span className="absolute left-3 top-3 rounded bg-brand px-3 py-1 text-xs font-bold uppercase text-ink">
					{p.category}
				</span>
				<span className="absolute bottom-3 right-3 grid size-10 translate-y-3 place-items-center rounded-full bg-brand text-ink opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
					<ArrowUpRight size={18} />
				</span>
			</Link>
			<div className="p-5">
				<h3 className="text-lg font-bold leading-snug">
					<Link href={`/proje-detay/${p.slug}`} className="hover:text-brand-700">
						{p.title}
					</Link>
				</h3>
				{p.place && (
					<p className="mt-2 flex items-center gap-1.5 text-sm text-ink-500">
						<MapPin size={14} />
						{p.place}
					</p>
				)}
			</div>
		</article>
	)
}
