"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import {
	Facebook,
	Instagram,
	Linkedin,
	Mail,
	MapPin,
	Clock,
	Menu,
	X,
	ChevronDown,
	Twitter,
} from "lucide-react"
import { cn, stripParagraphTags } from "@/lib/utils"

type Props = {
	company: string
	slogan: string
	logo: string
	email: string
	hours: string
	address: string
	social: { facebook: string; twitter: string; instagram: string; linkedin: string }
}

const NAV = [
	{ label: "Anasayfa", href: "/" },
	{
		label: "Kurumsal",
		children: [
			{ label: "Hakkımızda", href: "/hakkimizda" },
			{ label: "Vizyonumuz", href: "/vizyon" },
			{ label: "Misyonumuz", href: "/misyon" },
		],
	},
	{
		label: "Projelerimiz",
		href: "/proje-listesi",
		children: [
			{ label: "Devam Eden Projeler", href: "/devam-eden-projeler" },
			{ label: "Tamamlanan Projeler", href: "/tamamlanan-projeler" },
			{ label: "Planlanan Projeler", href: "/planlanan-projeler" },
		],
	},
	{
		label: "Galeriler",
		children: [
			{ label: "Resim Galerisi", href: "/resim-galerimiz" },
			{ label: "Video Galerisi", href: "/video-galerimiz" },
		],
	},
	{ label: "Grup Şirketlerimiz", href: "/referanslar" },
	{ label: "İletişim", href: "/iletisim" },
]

export function Header({ company, slogan, logo, email, hours, address, social }: Props) {
	const [open, setOpen] = useState(false)
	const [stuck, setStuck] = useState(false)
	const [sub, setSub] = useState<string | null>(null)
	const [desktopSub, setDesktopSub] = useState<string | null>(null)
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

	const clearCloseTimer = () => {
		if (!closeTimer.current) return
		clearTimeout(closeTimer.current)
		closeTimer.current = null
	}

	const openDesktopMenu = (label: string) => {
		clearCloseTimer()
		setDesktopSub(label)
	}

	const closeDesktopMenuSoon = () => {
		clearCloseTimer()
		closeTimer.current = setTimeout(() => setDesktopSub(null), 140)
	}

	useEffect(() => {
		const on = () => setStuck(window.scrollY > 40)
		on()
		window.addEventListener("scroll", on, { passive: true })
		return () => window.removeEventListener("scroll", on)
	}, [])

	useEffect(() => {
		return () => clearCloseTimer()
	}, [])

	const socials = [
		{ href: social.facebook, Icon: Facebook, label: "Facebook" },
		{ href: social.twitter, Icon: Twitter, label: "Twitter" },
		{ href: social.instagram, Icon: Instagram, label: "Instagram" },
		{ href: social.linkedin, Icon: Linkedin, label: "LinkedIn" },
	].filter((s) => s.href)
	const safeCompany = stripParagraphTags(company)
	const safeSlogan = stripParagraphTags(slogan)
	const safeEmail = stripParagraphTags(email)
	const safeHours = stripParagraphTags(hours)
	const safeAddress = stripParagraphTags(address)

	return (
		<header className="relative z-40">
			{/* üst şerit */}
			<div className="hidden bg-ink text-sm text-white/80 md:block">
				<div className="container flex items-center justify-between py-2">
					<p className="truncate">{safeSlogan}</p>
					<div className="flex items-center gap-4">
						<ul className="flex items-center gap-3">
							{socials.map(({ href, Icon, label }) => (
								<li key={label}>
									<a
										href={href}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={label}
										className="transition hover:text-brand"
									>
										<Icon size={16} />
									</a>
								</li>
							))}
						</ul>
						<Link
							href="/iletisim"
							className="rounded bg-brand px-4 py-1 text-xs font-bold uppercase text-ink hover:bg-brand-500"
						>
							Bize Ulaşın
						</Link>
					</div>
				</div>
			</div>

			{/* logo + bilgi kutuları */}
			<div className="hidden border-b border-ink-100 bg-white md:block">
				<div className="container flex items-center justify-between py-5">
					<Link href="/" aria-label={safeCompany}>
						{logo ? (
							<Image
								src={logo}
								alt={safeCompany}
								width={255}
								height={53}
								priority
								className="h-12 w-auto"
							/>
						) : (
							<span className="font-display text-2xl font-extrabold">{safeCompany}</span>
						)}
					</Link>
					<ul className="flex items-center gap-8 text-sm">
						{[
							{ Icon: MapPin, t: "Adres", v: safeAddress },
							{ Icon: Mail, t: "E-posta", v: safeEmail },
							{ Icon: Clock, t: "Çalışma Saatleri", v: safeHours },
						]
							.filter((x) => x.v)
							.map(({ Icon, t, v }) => (
								<li key={t} className="flex items-center gap-3">
									<span className="grid size-11 place-items-center rounded-full bg-brand/20 text-brand-700">
										<Icon size={20} />
									</span>
									<span className="max-w-[200px] leading-tight">
										<strong className="block text-ink">{t}</strong>
										<span className="line-clamp-2">{v}</span>
									</span>
								</li>
							))}
					</ul>
				</div>
			</div>

			{/* menü çubuğu (sticky) */}
			<div
				className={cn(
					"z-50 w-full bg-ink text-white transition-shadow md:sticky md:top-0",
					stuck && "shadow-lg shadow-black/20",
				)}
			>
				<div className="container flex items-center justify-between">
					<Link href="/" className="py-3 md:hidden" aria-label={safeCompany}>
						{logo ? (
							<Image
								src={logo}
								alt={safeCompany}
								width={255}
								height={53}
								className="h-9 w-auto brightness-0 invert"
							/>
						) : (
							<b>{safeCompany}</b>
						)}
					</Link>

					<nav
						aria-label="Ana menü"
						className="hidden md:block"
						onMouseEnter={clearCloseTimer}
						onMouseLeave={closeDesktopMenuSoon}
					>
						<ul className="flex">
							{NAV.map((n) => {
								const isOpen = desktopSub === n.label
								return (
									<li
										key={n.label}
										className="relative"
										onMouseEnter={() => n.children && openDesktopMenu(n.label)}
										onFocus={() => n.children && openDesktopMenu(n.label)}
										onBlur={(e) => {
											if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
												closeDesktopMenuSoon()
											}
										}}
									>
										{n.href ? (
											<Link
												href={n.href}
												aria-expanded={n.children ? isOpen : undefined}
												onKeyDown={(e) => {
													if (e.key === "Escape") setDesktopSub(null)
												}}
												className="flex items-center gap-1 px-5 py-4 text-sm font-semibold uppercase tracking-wide hover:text-brand"
											>
												{n.label}
												{n.children && (
													<ChevronDown
														size={14}
														className={cn(
															"transition-transform duration-150",
															isOpen && "rotate-180",
														)}
													/>
												)}
											</Link>
										) : (
											<button
												type="button"
												aria-expanded={isOpen}
												onClick={() => setDesktopSub((v) => (v === n.label ? null : n.label))}
												onKeyDown={(e) => {
													if (e.key === "Escape") setDesktopSub(null)
												}}
												className="flex items-center gap-1 px-5 py-4 text-sm font-semibold uppercase tracking-wide hover:text-brand"
											>
												{n.label}
												<ChevronDown
													size={14}
													className={cn(
														"transition-transform duration-150",
														isOpen && "rotate-180",
													)}
												/>
											</button>
										)}
										{n.children && (
											<ul
												className={cn(
													"absolute left-0 top-full min-w-56 rounded-b-lg border-t-2 border-brand bg-white py-2 shadow-card transition-all duration-150",
													isOpen
														? "visible translate-y-0 opacity-100"
														: "invisible translate-y-2 opacity-0",
												)}
												onMouseEnter={() => openDesktopMenu(n.label)}
												onMouseLeave={closeDesktopMenuSoon}
											>
												{n.children.map((c) => (
													<li key={c.href}>
														<Link
															href={c.href}
															onClick={() => setDesktopSub(null)}
															className="block px-5 py-2.5 text-sm text-ink hover:bg-brand/20"
														>
															{c.label}
														</Link>
													</li>
												))}
											</ul>
										)}
									</li>
								)
							})}
						</ul>
					</nav>

					<Link href="/iletisim" className="btn btn-brand hidden !py-2 md:inline-flex">
						Teklif Al
					</Link>
					<button
						type="button"
						className="p-3 md:hidden"
						aria-expanded={open}
						aria-label="Menüyü aç/kapat"
						onClick={() => setOpen((v) => !v)}
					>
						{open ? <X /> : <Menu />}
					</button>
				</div>

				{open && (
					<nav
						aria-label="Mobil menü"
						className="max-h-[75vh] overflow-y-auto border-t border-white/10 bg-ink-800 md:hidden"
					>
						<ul className="container py-2">
							{NAV.map((n) => (
								<li key={n.label} className="border-b border-white/10 last:border-0">
									{n.children ? (
										<>
											<button
												type="button"
												onClick={() => setSub(sub === n.label ? null : n.label)}
												className="flex w-full items-center justify-between py-3 font-semibold"
												aria-expanded={sub === n.label}
											>
												{n.label}
												<ChevronDown
													size={16}
													className={cn("transition", sub === n.label && "rotate-180")}
												/>
											</button>
											{sub === n.label && (
												<ul className="pb-2 pl-4">
													{n.children.map((c) => (
														<li key={c.href}>
															<Link
																href={c.href}
																onClick={() => setOpen(false)}
																className="block py-2 text-white/80"
															>
																{c.label}
															</Link>
														</li>
													))}
												</ul>
											)}
										</>
									) : (
										<Link
											href={n.href!}
											onClick={() => setOpen(false)}
											className="block py-3 font-semibold"
										>
											{n.label}
										</Link>
									)}
								</li>
							))}
						</ul>
					</nav>
				)}
			</div>
		</header>
	)
}
