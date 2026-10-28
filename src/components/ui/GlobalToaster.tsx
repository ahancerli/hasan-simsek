"use client"

import { Toaster } from "sonner"

export function GlobalToaster() {
	return <Toaster position="bottom-right" richColors closeButton duration={3200} />
}
