import { requirePermission } from "@/lib/security/session"
import { contactMessages } from "@/lib/db/tables"
import { formatDate, stripParagraphTags } from "@/lib/utils"

export default async function Messages() {
	await requirePermission("content", "read")
	const rows = await contactMessages.list({}, "id DESC", 200).catch(() => [])
	return (
		<>
			<h1 className="mb-6 text-2xl font-extrabold">Gelen Mesajlar</h1>
			{rows.length === 0 ? (
				<p className="rounded-xl bg-white p-10 text-center text-ink-500">Henüz mesaj yok.</p>
			) : (
				<ul className="space-y-4">
					{rows.map((r) => (
						<li key={r.id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
							<div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
								<b>{stripParagraphTags(r.name)}</b>
								<span className="text-ink-500">
									{formatDate(r.createdAt)}{" "}
									{Number(r.mail_sent) === 1 ? "" : "· mail gönderilemedi"}
								</span>
							</div>
							<p className="text-xs text-ink-500">
								{stripParagraphTags(r.email)} · {stripParagraphTags(r.phone ?? "")} ·{" "}
								{stripParagraphTags(r.subject ?? "")}
							</p>
							<p className="mt-3 whitespace-pre-wrap text-sm">{stripParagraphTags(r.message)}</p>
						</li>
					))}
				</ul>
			)}
		</>
	)
}
