import type { Metadata, Viewport } from "next"
import { Heebo, Montserrat } from "next/font/google"
import { headers } from "next/headers"
import { GlobalToaster } from "@/components/ui/GlobalToaster"
import "./globals.css"

const heebo = Heebo({ subsets: ["latin", "latin-ext"], variable: "--font-heebo", display: "swap" })
const montserrat = Montserrat({
	subsets: ["latin", "latin-ext"],
	variable: "--font-montserrat",
	display: "swap",
})

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fdc236" }
export const metadata: Metadata = { title: "Hasan Şimşek İnşaat" }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	// Dinamik render + CSP nonce'ının Next'in script'lerine uygulanması için
	await headers()
	return (
		<html lang="tr" suppressHydrationWarning className={`${heebo.variable} ${montserrat.variable}`}>
			<body>
				{children}
				<GlobalToaster />
			</body>
		</html>
	)
}
