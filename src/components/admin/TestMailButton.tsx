"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { sendTestMailAction, type FormState } from "@/app/admin/actions";

export function TestMailButton() {
  const [s, action, pending] = useActionState<FormState>(sendTestMailAction, { ok: false });
  return (
    <form action={action} className="flex items-center gap-4">
      <button disabled={pending} className="btn btn-dark"><Send size={16} />{pending ? "Gönderiliyor…" : "Test e-postası gönder"}</button>
      {s.message && <span role="status" className={`text-sm ${s.ok ? "text-green-700" : "text-red-600"}`}>{s.message}</span>}
    </form>
  );
}
