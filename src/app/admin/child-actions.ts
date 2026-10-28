"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getModule } from "@/modules/registry";
import { requirePermission } from "@/lib/security/session";
import { audit } from "@/lib/security/audit";
import { flashUrl } from "@/lib/flash";
import { CONTENT_TAG } from "@/lib/site-config";
import { saveImage, saveDocument, removeUpload, removeLegacyPath, UploadError } from "@/lib/storage";
import { portfolioImages, productImages, galleryImages, galleryFiles, galleryVideos } from "@/lib/db/tables";
import { parseVideo } from "@/lib/video";
import { query } from "@/lib/db/d1";
import { logError } from "@/lib/logger";
import type { Child, ModuleDef } from "@/modules/types";
import type { Row } from "@/lib/db/repo";

const REPOS = {
  portfolio_images: portfolioImages,
  product_images: productImages,
  images: galleryImages,
  files: galleryFiles,
  videos: galleryVideos,
} as const;

function resolve(moduleKey: string, childKey: string): { m: ModuleDef; c: Child } {
  const m = getModule(moduleKey);
  const c = m?.children?.find((x) => x.key === childKey);
  if (!m || !c) throw new Error("not-found");
  return { m, c };
}

const back = (m: string, id: number, c: string) => `/admin/${m}/${id}/${c}`;
function refresh(m: string, id: number, c: string) {
  revalidateTag(CONTENT_TAG);
  revalidatePath(back(m, id, c));
  revalidatePath("/", "layout");
}

/** Çocuk kaydın gerçekten bu ebeveyne ait olduğunu doğrular (IDOR koruması). */
async function ownedChild(c: Child, parentId: number, childId: number): Promise<Row | null> {
  const row = await REPOS[c.table].get({ id: childId });
  return row && Number(row[c.parentField]) === parentId ? row : null;
}

export async function childUploadAction(moduleKey: string, parentId: number, childKey: string, fd: FormData) {
  const { m, c } = resolve(moduleKey, childKey);
  const user = await requirePermission(m.scope, "update");
  const parent = await m.repo.get({ id: parentId });
  if (!parent) redirect(flashUrl(`/admin/${m.key}`, { type: "error", text: "Kayıt bulunamadı." }));
  const repo = REPOS[c.table];

  let ok = 0;
  let err = "";
  try {
    if (c.kind === "video") {
      const embed = parseVideo(fd.get("url"));
      if (!embed) throw new UploadError("Yalnızca YouTube veya Vimeo bağlantısı kabul edilir.");
      await repo.insert({ [c.parentField]: parentId, url: embed.src, rank: 0, isActive: 1, createdAt: new Date().toISOString() });
      ok = 1;
    } else {
      const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 20);
      if (!files.length) throw new UploadError("Dosya seçilmedi.");
      const sub = c.urlMode === "path" ? String(parent.folder_name ?? "") : "";
      if (c.urlMode === "path" && !/^[a-z0-9-]+$/.test(sub)) throw new UploadError("Galeri klasörü geçersiz.");
      for (const file of files) {
        const name =
          c.kind === "image"
            ? await saveImage(c.folder, file, { resolutions: c.resolutions, subdir: sub || undefined })
            : await saveDocument(c.folder, file, sub);
        const value = c.urlMode === "path" ? `uploads/${c.folder}/${sub}/${name}` : name;
        await repo.insert({
          [c.parentField]: parentId,
          [c.urlField]: value,
          ...(c.cover ? { isCover: 0 } : {}),
          rank: 0,
          isActive: 1,
          createdAt: new Date().toISOString(),
        });
        ok++;
      }
    }
  } catch (e) {
    if (e instanceof UploadError) err = e.message;
    else {
      logError("admin.child.upload", e);
      err = "Yükleme sırasında bir hata oluştu.";
    }
  }
  await audit(user.uid, "child-upload", `${m.key}/${c.key}`, parentId);
  refresh(m.key, parentId, c.key);
  redirect(flashUrl(back(m.key, parentId, c.key), err ? { type: "error", text: err } : { type: "success", text: `${ok} öğe eklendi.` }));
}

export async function childDeleteAction(moduleKey: string, parentId: number, childKey: string, childId: number) {
  const { m, c } = resolve(moduleKey, childKey);
  const user = await requirePermission(m.scope, "delete");
  const row = await ownedChild(c, parentId, childId);
  if (row) {
    if (c.kind !== "video") {
      if (c.urlMode === "path") await removeLegacyPath(row[c.urlField]);
      else await removeUpload(c.folder, row[c.urlField], (c.resolutions ?? []).map((r) => `${r.w}x${r.h}`));
    }
    await REPOS[c.table].remove(childId);
    await audit(user.uid, "child-delete", `${m.key}/${c.key}`, childId);
  }
  refresh(m.key, parentId, c.key);
  redirect(flashUrl(back(m.key, parentId, c.key), { type: "success", text: "Öğe silindi." }));
}

export async function childToggleAction(moduleKey: string, parentId: number, childKey: string, childId: number) {
  const { m, c } = resolve(moduleKey, childKey);
  const user = await requirePermission(m.scope, "update");
  const row = await ownedChild(c, parentId, childId);
  if (row) {
    await REPOS[c.table].update(childId, { isActive: Number(row.isActive) === 1 ? 0 : 1 });
    await audit(user.uid, "child-toggle", `${m.key}/${c.key}`, childId);
  }
  refresh(m.key, parentId, c.key);
}

export async function childMoveAction(moduleKey: string, parentId: number, childKey: string, childId: number, dir: "up" | "down") {
  const { m, c } = resolve(moduleKey, childKey);
  await requirePermission(m.scope, "update");
  const rows = await REPOS[c.table].list({ [c.parentField]: parentId }, "rank ASC");
  rows.sort((a, b) => Number(a.rank) - Number(b.rank) || a.id - b.id);
  const i = rows.findIndex((r) => r.id === childId);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= rows.length) return;
  [rows[i], rows[j]] = [rows[j], rows[i]];
  await REPOS[c.table].setRanks(rows.map((r) => r.id));
  refresh(m.key, parentId, c.key);
}

export async function childCoverAction(moduleKey: string, parentId: number, childKey: string, childId: number) {
  const { m, c } = resolve(moduleKey, childKey);
  const user = await requirePermission(m.scope, "update");
  if (!c.cover) return;
  const row = await ownedChild(c, parentId, childId);
  if (!row) return;
  // tek parametreli sorgu: kapak = (id eşleşirse 1)
  await query(`UPDATE "${c.table}" SET "isCover" = CASE WHEN "id" = ? THEN 1 ELSE 0 END WHERE "${c.parentField}" = ?`, [childId, parentId]);
  await audit(user.uid, "child-cover", `${m.key}/${c.key}`, childId);
  refresh(m.key, parentId, c.key);
}
