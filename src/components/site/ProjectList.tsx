import { contentService } from "@/lib/services/content-service"
import { ProjectCard, type ProjectItem } from "./ProjectCard"

/** Eski `getCoverPortfolioImage` N+1 sorgusu yerine tek sorguda kapak haritası. */
export async function loadProjects(categoryId?: number): Promise<ProjectItem[]> {
	return contentService.getProjectCards(categoryId)
}

export async function ProjectList({ categoryId }: { categoryId?: number }) {
	const items = await loadProjects(categoryId)
	if (!items.length)
		return (
			<p className="rounded-lg bg-ink-100 p-10 text-center text-ink-500">
				Bu bölümde henüz proje bulunmuyor.
			</p>
		)
	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{items.map((p, i) => (
				<ProjectCard key={p.id} p={p} priority={i < 3} />
			))}
		</div>
	)
}
