"use client"

import { useActionState, useEffect } from "react"
import { Send } from "lucide-react"
import { toast } from "sonner"
import { sendContactMessage, type ContactState } from "@/app/actions"
import { cn } from "@/lib/utils"

const initial: ContactState = { ok: false }

export function ContactForm({ compact = false }: { compact?: boolean }) {
	const [state, action, pending] = useActionState(sendContactMessage, initial)
	const err = (k: string) => state.errors?.[k]

	useEffect(() => {
		if (!state.message) return
		if (state.ok) toast.success(state.message)
		else toast.error(state.message)
	}, [state.message, state.ok])

	if (state.ok) {
		return (
			<p
				role="status"
				className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
			>
				{state.message}
			</p>
		)
	}

	return (
		<form action={action} className="space-y-4" noValidate>
			{/* honeypot: botlar doldurur, insanlar görmez */}
			<div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
				<label>
					Web sitesi
					<input type="text" name="website" tabIndex={-1} autoComplete="off" />
				</label>
			</div>

			<div className={cn("grid gap-4", !compact && "md:grid-cols-2")}>
				<Field
					name="name"
					label="Adınız Soyadınız"
					error={err("name")}
					autoComplete="name"
					required
				/>
				<Field
					name="email"
					type="email"
					label="E-posta"
					error={err("email")}
					autoComplete="email"
					required
				/>
				{!compact && (
					<Field name="phone" type="tel" label="Telefon" error={err("phone")} autoComplete="tel" />
				)}
				{!compact && <Field name="subject" label="Konu" error={err("subject")} />}
			</div>
			<div>
				<label htmlFor="message" className="mb-1 block text-sm font-semibold">
					Mesajınız
				</label>
				<textarea
					id="message"
					name="message"
					rows={compact ? 3 : 6}
					required
					maxLength={3000}
					className="input"
					aria-invalid={!!err("message")}
				/>
				{err("message") && <p className="mt-1 text-sm text-red-600">{err("message")}</p>}
			</div>
			{state.message && !state.ok && (
				<p role="alert" className="text-sm text-red-600">
					{state.message}
				</p>
			)}
			<button type="submit" disabled={pending} className="btn btn-brand">
				<Send size={16} />
				{pending ? "Gönderiliyor…" : "Mesaj Gönder"}
			</button>
		</form>
	)
}

function Field({
	name,
	label,
	error,
	type = "text",
	...rest
}: {
	name: string
	label: string
	error?: string
	type?: string
	autoComplete?: string
	required?: boolean
}) {
	return (
		<div>
			<label htmlFor={name} className="mb-1 block text-sm font-semibold">
				{label}
			</label>
			<input
				id={name}
				name={name}
				type={type}
				maxLength={254}
				className="input"
				aria-invalid={!!error}
				{...rest}
			/>
			{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
		</div>
	)
}
