import type { ProjectItem } from "@/components/site/ProjectCard"

type ProjectsResponse = { items?: ProjectItem[]; error?: string }

export async function fetchProjects(
	categoryId?: number,
	signal?: AbortSignal,
): Promise<ProjectItem[]> {
	const q = categoryId ? `?categoryId=${categoryId}` : ""
	const res = await fetch(`/api/be/projects${q}`, { method: "GET", signal })
	if (!res.ok) throw new Error("Projeler alınamadı")
	const data = (await res.json()) as ProjectsResponse
	return Array.isArray(data.items) ? data.items : []
}
