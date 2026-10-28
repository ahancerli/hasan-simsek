"use client"

import { useEffect, useMemo, useState } from "react"
import { ProjectCard, type ProjectItem } from "./ProjectCard"
import { cn } from "@/lib/utils"
import { fetchProjects } from "@/lib/frontend-api"

export type Tab = { key: string; label: string; categoryId?: number; items?: ProjectItem[] }

export function ProjectTabs({ tabs }: { tabs: Tab[] }) {
	const [active, setActive] = useState(tabs[0]?.key)
	const [loading, setLoading] = useState<string | null>(null)
	const [itemsByKey, setItemsByKey] = useState<Record<string, ProjectItem[]>>(() =>
		Object.fromEntries(tabs.map((t) => [t.key, t.items ?? []])),
	)
	const [loadedKeys, setLoadedKeys] = useState<Record<string, boolean>>(() =>
		Object.fromEntries(tabs.map((t) => [t.key, Boolean(t.items)])),
	)

	const current = tabs.find((t) => t.key === active) ?? tabs[0]
	const currentItems = current ? (itemsByKey[current.key] ?? []) : []

	const activeCategory = useMemo(() => current?.categoryId, [current])

	useEffect(() => {
		if (!current || !activeCategory) return
		if (loadedKeys[current.key]) return

		const ctrl = new AbortController()
		setLoading(current.key)
		fetchProjects(activeCategory, ctrl.signal)
			.then((items) => {
				setItemsByKey((prev) => ({ ...prev, [current.key]: items }))
				setLoadedKeys((prev) => ({ ...prev, [current.key]: true }))
			})
			.catch(() => {
				setItemsByKey((prev) => ({ ...prev, [current.key]: [] }))
				setLoadedKeys((prev) => ({ ...prev, [current.key]: true }))
			})
			.finally(() => {
				setLoading((prev) => (prev === current.key ? null : prev))
			})

		return () => ctrl.abort()
	}, [current, activeCategory, loadedKeys])

	if (!current) return null
	return (
		<div>
			<div role="tablist" aria-label="Proje kategorileri" className="mb-10 flex flex-wrap gap-2">
				{tabs.map((t) => (
					<button
						key={t.key}
						role="tab"
						type="button"
						aria-selected={t.key === active}
						onClick={() => setActive(t.key)}
						className={cn(
							"rounded-full px-5 py-2 text-sm font-semibold transition",
							t.key === active
								? "bg-brand text-ink"
								: "bg-white text-ink-600 ring-1 ring-ink-300 hover:ring-brand",
						)}
					>
						{t.label} <span className="opacity-60">({itemsByKey[t.key]?.length ?? 0})</span>
					</button>
				))}
			</div>
			{loading === current.key ? (
				<div role="status" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, idx) => (
						<div
							key={idx}
							className="overflow-hidden rounded-xl bg-white shadow-card ring-1 ring-black/5"
						>
							<div className="aspect-[4/3] animate-pulse bg-ink-100" />
							<div className="space-y-3 p-5">
								<div className="h-4 w-4/5 animate-pulse rounded bg-ink-100" />
								<div className="h-3 w-1/2 animate-pulse rounded bg-ink-100" />
							</div>
						</div>
					))}
				</div>
			) : currentItems.length ? (
				<div role="tabpanel" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{currentItems.slice(0, 9).map((p) => (
						<ProjectCard key={p.id} p={p} />
					))}
				</div>
			) : (
				<p className="rounded-lg bg-white p-8 text-center text-ink-500">
					Bu kategoride henüz proje yok.
				</p>
			)}
		</div>
	)
}
