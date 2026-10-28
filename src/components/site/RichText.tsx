import { cleanRichText } from "@/lib/security/sanitize";

/** Sunucuda, beyaz liste ile temizlenmiş HTML basar. Zengin metin yalnızca burada (ve sanitize edilmiş PopupModal içeriğinde) HTML olarak basılır. */
export function RichText({ html, className = "" }: { html: unknown; className?: string }) {
  return <div className={`rich ${className}`} dangerouslySetInnerHTML={{ __html: cleanRichText(html) }} />;
}
