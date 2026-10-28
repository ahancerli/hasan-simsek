export default function SiteLoading() {
	return (
		<section className="py-20 md:py-28">
			<div className="container">
				<div className="grid place-items-center rounded-2xl bg-ink-100/70 px-6 py-16 ring-1 ring-ink-100">
					<div className="flex flex-col items-center gap-3 text-ink-500">
						<span className="spinner size-10 border-[3px]" aria-hidden />
						<p className="text-sm font-semibold">Sayfa yükleniyor…</p>
					</div>
				</div>
			</div>
		</section>
	)
}
