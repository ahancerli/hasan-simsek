import Link from "next/link"
import Image from "next/image"
import { MapPin, Mail, Phone, Clock } from "lucide-react"
import { ContactForm } from "./ContactForm"
import { stripParagraphTags } from "@/lib/utils"

type Props = {
	company: string
	slogan: string
	footerLogo: string
	address: string
	email: string
	phone: string
	hours: string
}

export function Footer({ company, slogan, footerLogo, address, email, phone, hours }: Props) {
	const safeCompany = stripParagraphTags(company)
	const safeSlogan = stripParagraphTags(slogan)
	const safeAddress = stripParagraphTags(address)
	const safeEmail = stripParagraphTags(email)
	const safePhone = stripParagraphTags(phone)
	const safeHours = stripParagraphTags(hours)

	return (
		<footer className="bg-ink text-white/75">
			<div className="container grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
				<div>
					{footerLogo ? (
						<Image
							src={footerLogo}
							alt={safeCompany}
							width={255}
							height={53}
							className="mb-5 h-11 w-auto"
						/>
					) : (
						<b className="mb-5 block text-xl text-white">{safeCompany}</b>
					)}
					<p className="mb-5 text-sm leading-relaxed">{safeSlogan}</p>
					<ul className="space-y-3 text-sm">
						{safeAddress && (
							<li className="flex gap-3">
								<MapPin size={18} className="mt-0.5 shrink-0 text-brand" />
								{safeAddress}
							</li>
						)}
						{safeEmail && (
							<li className="flex gap-3">
								<Mail size={18} className="shrink-0 text-brand" />
								<a href={`mailto:${safeEmail}`} className="hover:text-brand">
									{safeEmail}
								</a>
							</li>
						)}
						{safePhone && (
							<li className="flex gap-3">
								<Phone size={18} className="shrink-0 text-brand" />
								<a href={`tel:${safePhone.replace(/\s/g, "")}`} className="hover:text-brand">
									{safePhone}
								</a>
							</li>
						)}
					</ul>
				</div>

				<div>
					<h2 className="mb-5 text-lg font-bold text-white">Kurumsal</h2>
					<ul className="space-y-2 text-sm">
						{[
							["Hakkımızda", "/hakkimizda"],
							["Vizyonumuz", "/vizyon"],
							["Misyonumuz", "/misyon"],
							["Grup Şirketlerimiz", "/referanslar"],
							["Projelerimiz", "/proje-listesi"],
							["İletişim", "/iletisim"],
						].map(([l, h]) => (
							<li key={h}>
								<Link href={h} className="transition hover:text-brand">
									{l}
								</Link>
							</li>
						))}
					</ul>
				</div>

				<div>
					<h2 className="mb-5 text-lg font-bold text-white">Çalışma Saatlerimiz</h2>
					<p className="flex gap-3 text-sm">
						<Clock size={18} className="shrink-0 text-brand" />
						{safeHours || "—"}
					</p>
				</div>

				<div>
					<h2 className="mb-5 text-lg font-bold text-white">Bize Ulaşın</h2>
					<ContactForm compact />
				</div>
			</div>
			<div className="border-t border-white/10 py-5 text-center text-sm">
				© {new Date().getFullYear()} {safeCompany}. Tüm hakları saklıdır.
			</div>
		</footer>
	)
}
