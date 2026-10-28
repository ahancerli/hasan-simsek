export default function AdminPanelLoading() {
	return (
		<div className="grid min-h-[55vh] place-items-center">
			<div className="flex flex-col items-center gap-3 text-ink-500">
				<span className="spinner size-10 border-[3px]" aria-hidden />
				<p className="text-sm font-semibold">İçerik yükleniyor…</p>
			</div>
		</div>
	)
}
