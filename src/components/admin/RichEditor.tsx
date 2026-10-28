"use client";

import { useRef } from "react";
import { Bold, Italic, List, ListOrdered, Link2, Heading2 } from "lucide-react";

/** Hafif HTML editörü: seçimi etiketle sarar. Kaydederken sunucu beyaz liste ile TEMİZLER. */
export function RichEditor({ name, defaultValue, label }: { name: string; defaultValue?: string; label: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const wrap = (open: string, close: string) => {
    const t = ref.current; if (!t) return;
    const { selectionStart: s, selectionEnd: e, value } = t;
    t.setRangeText(open + (value.slice(s, e) || "metin") + close, s, e, "end");
    t.focus();
  };
  const tools = [
    { I: Bold, t: "Kalın", o: "<strong>", c: "</strong>" }, { I: Italic, t: "İtalik", o: "<em>", c: "</em>" },
    { I: Heading2, t: "Başlık", o: "<h2>", c: "</h2>" }, { I: List, t: "Liste", o: "<ul><li>", c: "</li></ul>" },
    { I: ListOrdered, t: "Numaralı liste", o: "<ol><li>", c: "</li></ol>" },
  ];
  return (
    <div className="rounded-md border border-ink-300 bg-white focus-within:ring-2 focus-within:ring-brand/50">
      <div className="flex gap-1 border-b border-ink-100 bg-ink-100/60 p-1.5" role="toolbar" aria-label={`${label} araçları`}>
        {tools.map(({ I, t, o, c }) => (
          <button key={t} type="button" title={t} aria-label={t} onClick={() => wrap(o, c)} className="rounded p-1.5 hover:bg-white"><I size={16} /></button>
        ))}
        <button type="button" title="Bağlantı" aria-label="Bağlantı" className="rounded p-1.5 hover:bg-white" onClick={() => { const u = prompt("Bağlantı adresi (https://…)"); if (u) wrap(`<a href="${u.replace(/"/g, "")}">`, "</a>"); }}><Link2 size={16} /></button>
      </div>
      <textarea ref={ref} id={name} name={name} defaultValue={defaultValue} rows={10} className="w-full resize-y rounded-b-md p-3 font-mono text-sm outline-none" />
    </div>
  );
}
