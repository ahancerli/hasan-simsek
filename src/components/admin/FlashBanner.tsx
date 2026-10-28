import { CheckCircle2, AlertCircle } from "lucide-react";
import { readFlash } from "@/lib/flash";

export function FlashBanner({ param }: { param?: string | string[] }) {
  const f = readFlash(param);
  if (!f) return null;
  const ok = f.type === "success";
  return (
    <div role={ok ? "status" : "alert"} className={`mb-6 flex items-center gap-3 rounded-lg border p-4 text-sm ${ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
      {ok ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}{f.text}
    </div>
  );
}
