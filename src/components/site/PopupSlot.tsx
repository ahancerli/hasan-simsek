import { cookies } from "next/headers";
import { getPopup } from "@/lib/data";
import { cleanRichText, stripHtml } from "@/lib/security/sanitize";
import { PopupModal } from "./PopupModal";

/** Eski `includes/popup.php` karşılığı: sayfaya atanmış aktif popup, "bir daha gösterme" çerezi yoksa. */
export async function PopupSlot({ page }: { page: "home_v" | "about_v" | "contact_v" }) {
  const popup = await getPopup(page);
  if (!popup) return null;
  const id = String(popup.popup_uniq_id ?? "");
  if (!/^[a-f0-9]{8,32}$/i.test(id)) return null;
  if ((await cookies()).get(`popup_${id}`)) return null;
  return <PopupModal id={id} title={stripHtml(popup.title)} html={cleanRichText(popup.description)} />;
}
