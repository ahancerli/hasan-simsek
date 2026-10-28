import "server-only";
import {
  slides, portfolios, portfolioCategories, references, brands, services, products, news, courses,
  testimonials, popups, galleries, users, settings,
} from "@/lib/db/tables";
import { hashPassword, PASSWORD_MAX, PASSWORD_MIN } from "@/lib/security/password";
import { ROLES } from "@/lib/security/roles";
import { slugify } from "@/lib/utils";
import { query } from "@/lib/db/d1";
import type { Child, ModuleDef } from "./types";
import { randomBytes } from "node:crypto";

/**
 * MODÜL KAYIT DEFTERİ – admin panelin tek gerçeği.
 * Yeni modül = buraya bir tanım. Liste/ekle/düzenle/sil/aktif-pasif/sıralama/yetki/denetim/
 * önbellek yenileme/SEO/görsel yükleme hepsi generic motorda hazırdır.
 */
const R_350 = { w: 350, h: 217 };
const R_555 = { w: 555, h: 343 };
const RES = [R_555, R_350];

const portfolioImageChild: Child = {
  key: "gorseller", label: "Görseller", kind: "image", table: "portfolio_images", parentField: "portfolio_id",
  folder: "portfolios_v", urlField: "img_url", urlMode: "name", cover: true,
};
const productImageChild: Child = {
  key: "gorseller", label: "Görseller", kind: "image", table: "product_images", parentField: "product_id",
  folder: "product_v", resolutions: RES, urlField: "img_url", urlMode: "name", cover: true,
};
const galleryChildren: Child[] = [
  { key: "resimler", label: "Resimler", kind: "image", table: "images", parentField: "gallery_id", folder: "galleries_v/images", urlField: "url", urlMode: "path", onlyForType: "image" },
  { key: "dosyalar", label: "Dosyalar", kind: "file", table: "files", parentField: "gallery_id", folder: "galleries_v/files", urlField: "url", urlMode: "path", onlyForType: "file" },
  { key: "videolar", label: "Videolar", kind: "video", table: "videos", parentField: "gallery_id", folder: "", urlField: "url", urlMode: "path", onlyForType: "video" },
];

const text = (name: string, label: string, extra: object = {}) => ({ name, label, type: "text" as const, ...extra });
const area = (name: string, label: string, extra: object = {}) => ({ name, label, type: "textarea" as const, ...extra });
const rich = (name: string, label: string, extra: object = {}) => ({ name, label, type: "richtext" as const, ...extra });
const img = (name: string, label: string, folder: string, extra: object = {}) => ({ name, label, type: "image" as const, folder, ...extra });

export const MODULES: ModuleDef[] = [
  {
    key: "settings", title: "Site Ayarları", singular: "Site Ayarı", icon: "Settings", group: "Sistem", scope: "system",
    repo: settings, singleton: true,
    fields: [
      text("company_name", "Şirket Adı", { required: true, max: 120 }),
      text("slogan", "Slogan", { max: 200 }),
      text("working_hours", "Çalışma Saatleri", { max: 120 }),
      text("phone_1", "Telefon 1", { required: true, max: 40 }),
      text("phone_2", "Telefon 2", { max: 40 }),
      text("fax_1", "Faks 1", { max: 40 }),
      text("fax_2", "Faks 2", { max: 40 }),
      { name: "email", label: "E-posta", type: "email", required: true, max: 160 },
      area("address", "Adres", { max: 400 }),
      rich("about_us", "Hakkımızda"),
      rich("mission", "Misyon"),
      rich("vision", "Vizyon"),
      { name: "facebook", label: "Facebook", type: "url" },
      { name: "twitter", label: "Twitter / X", type: "url" },
      { name: "instagram", label: "Instagram", type: "url" },
      { name: "linkedin", label: "LinkedIn", type: "url" },
      area("meta_description", "Varsayılan Meta Açıklama", { max: 300, help: "SEO kaydı olmayan sayfalar bunu kullanır (≈155 karakter ideal)." }),
      area("meta_keywords", "Varsayılan Anahtar Kelimeler", { max: 400 }),
      img("logo", "Logo", "settings_v"),
      img("favicon", "Favicon", "settings_v"),
      img("footer_logo", "Footer Logo", "settings_v"),
    ],
    listColumns: ["company_name"],
    beforeSave: async (d) => ({ data: { ...d, updatedAt: new Date().toISOString() } }),
  },
  {
    key: "slides", title: "Slider Yönetimi", singular: "Slayt", icon: "Layers", group: "İçerik", scope: "content",
    repo: slides, sortable: true, toggleActive: true,
    fields: [
      text("title", "Başlık", { required: true, max: 160 }),
      area("description", "Açıklama", { max: 500 }),
      { name: "allowButton", label: "Buton göster", type: "switch" },
      text("button_caption", "Buton Yazısı", { max: 60 }),
      { name: "button_url", label: "Buton Bağlantısı", type: "url", help: "Örn. /iletisim veya https://…" },
      img("img_url", "Slayt Görseli (1920×687 önerilir)", "slides_v", { required: true }),
    ],
    listColumns: ["img_url", "title"],
  },
  {
    key: "portfolio_categories", title: "Proje Kategorileri", singular: "Kategori", icon: "Tags", group: "İçerik", scope: "content",
    repo: portfolioCategories, toggleActive: true,
    fields: [text("title", "Başlık", { required: true, max: 120 })],
    listColumns: ["title"],
    canDelete: async (row) => {
      const r = await query<{ c: number }>(`SELECT COUNT(*) AS c FROM "portfolios" WHERE "category_id" = ?`, [row.id]);
      return Number(r.rows[0]?.c) > 0 ? "Bu kategoriye bağlı projeler var; önce projeleri taşıyın." : null;
    },
  },
  {
    key: "portfolio", title: "Projeler", singular: "Proje", icon: "Building2", group: "İçerik", scope: "content",
    repo: portfolios, sortable: true, toggleActive: true, seo: true, slug: { from: "title", to: "url" },
    children: [portfolioImageChild],
    fields: [
      text("title", "Proje Adı", { required: true, max: 160 }),
      { name: "category_id", label: "Kategori", type: "select", required: true, options: "portfolio_categories" },
      text("client", "Müşteri", { required: true, max: 160 }),
      text("place", "Yer", { max: 160 }),
      { name: "finishedAt", label: "Bitiş Tarihi", type: "date", required: true },
      { name: "portfolio_url", label: "Proje Bağlantısı", type: "url" },
      rich("description", "Açıklama"),
    ],
    listColumns: ["title", "category_id", "client", "finishedAt"],
    beforeDelete: async (row) => {
      await query(`DELETE FROM "portfolio_images" WHERE "portfolio_id" = ?`, [row.id]);
    },
  },
  {
    key: "galleries", title: "Galeri Yönetimi", singular: "Galeri", icon: "Images", group: "Medya", scope: "content",
    repo: galleries, sortable: true, toggleActive: true, children: galleryChildren,
    fields: [
      text("title", "Galeri Adı", { required: true, max: 160 }),
      {
        name: "gallery_type", label: "Galeri Türü", type: "select", required: true, createOnly: true,
        options: [{ value: "image", label: "Resim" }, { value: "file", label: "Dosya" }, { value: "video", label: "Video" }],
      },
    ],
    listColumns: ["title", "gallery_type"],
    beforeSave: async (d, { existing }) => {
      if (existing) return { data: d };
      const folder = slugify(String(d.title ?? ""), 80) || `galeri-${randomBytes(3).toString("hex")}`;
      const type = String(d.gallery_type);
      const url = type === "image" ? `uploads/galleries_v/images/${folder}` : type === "file" ? `uploads/galleries_v/files/${folder}` : "";
      return { data: { ...d, folder_name: folder, url } };
    },
    beforeDelete: async (row) => {
      for (const t of ["images", "files", "videos"]) await query(`DELETE FROM "${t}" WHERE "gallery_id" = ?`, [row.id]);
    },
  },
  {
    key: "references", title: "Grup Şirketleri / Referanslar", singular: "Referans", icon: "Handshake", group: "İçerik", scope: "content",
    repo: references, sortable: true, toggleActive: true,
    fields: [text("title", "Başlık", { required: true, max: 160 }), area("description", "Açıklama", { max: 600 }), img("img_url", "Görsel", "references_v", { required: true })],
    listColumns: ["img_url", "title"],
  },
  {
    key: "brands", title: "Marka Yönetimi", singular: "Marka", icon: "Puzzle", group: "İçerik", scope: "content",
    repo: brands, sortable: true, toggleActive: true,
    fields: [text("title", "Başlık", { required: true, max: 160 }), img("img_url", "Logo", "brands_v", { required: true })],
    listColumns: ["img_url", "title"],
  },
  {
    key: "services", title: "Hizmet Yönetimi", singular: "Hizmet", icon: "Wrench", group: "İçerik", scope: "content",
    repo: services, sortable: true, toggleActive: true, slug: { from: "title", to: "url" },
    fields: [text("title", "Başlık", { required: true, max: 160 }), rich("description", "Açıklama"), img("img_url", "Görsel", "services_v", { required: true, resolutions: RES })],
    listColumns: ["img_url", "title"],
  },
  {
    key: "product", title: "Ürün Yönetimi", singular: "Ürün", icon: "Boxes", group: "İçerik", scope: "content",
    repo: products, sortable: true, toggleActive: true, slug: { from: "title", to: "url" }, children: [productImageChild],
    fields: [text("title", "Başlık", { required: true, max: 160 }), rich("description", "Açıklama")],
    listColumns: ["title"],
    beforeDelete: async (row) => {
      await query(`DELETE FROM "product_images" WHERE "product_id" = ?`, [row.id]);
    },
  },
  {
    key: "news", title: "Haber Yönetimi", singular: "Haber", icon: "Newspaper", group: "İçerik", scope: "content",
    repo: news, sortable: true, toggleActive: true, slug: { from: "title", to: "url" },
    fields: [
      text("title", "Başlık", { required: true, max: 160 }),
      { name: "news_type", label: "Haber Türü", type: "select", required: true, options: [{ value: "image", label: "Resim" }, { value: "video", label: "Video" }] },
      rich("description", "Açıklama"),
      img("img_url", "Görsel", "news_v"),
      { name: "video_url", label: "Video URL (YouTube/Vimeo)", type: "url" },
    ],
    listColumns: ["img_url", "title", "news_type"],
  },
  {
    key: "courses", title: "Eğitim Yönetimi", singular: "Eğitim", icon: "CalendarDays", group: "İçerik", scope: "content",
    repo: courses, sortable: true, toggleActive: true, slug: { from: "title", to: "url" },
    fields: [text("title", "Başlık", { required: true, max: 160 }), { name: "event_date", label: "Tarih", type: "date", required: true }, rich("description", "Açıklama"), img("img_url", "Görsel", "courses_v")],
    listColumns: ["img_url", "title", "event_date"],
  },
  {
    key: "testimonials", title: "Müşteri Yorumları", singular: "Yorum", icon: "MessageSquareQuote", group: "İçerik", scope: "content",
    repo: testimonials, sortable: true, toggleActive: true,
    fields: [text("full_name", "Ad Soyad", { required: true, max: 120 }), text("company", "Şirket", { required: true, max: 120 }), text("title", "Başlık", { required: true, max: 160 }), area("description", "Yorum", { max: 1000 }), img("img_url", "Fotoğraf", "testimonials_v")],
    listColumns: ["img_url", "full_name", "company"],
  },
  {
    key: "popups", title: "Popup Yönetimi", singular: "Popup", icon: "Lamp", group: "İçerik", scope: "content",
    repo: popups, toggleActive: true,
    fields: [
      text("title", "Başlık", { required: true, max: 160 }),
      { name: "page", label: "Gösterileceği Sayfa", type: "select", required: true, options: [{ value: "home_v", label: "Anasayfa" }, { value: "about_v", label: "Hakkımızda" }, { value: "contact_v", label: "İletişim" }] },
      rich("description", "İçerik"),
    ],
    listColumns: ["title", "page"],
    defaults: () => ({ popup_uniq_id: randomBytes(7).toString("hex") }),
  },
  {
    key: "users", title: "Kullanıcı Yönetimi", singular: "Kullanıcı", icon: "ShieldUser", group: "Sistem", scope: "system",
    repo: users, toggleActive: true,
    fields: [
      text("full_name", "Ad Soyad", { required: true, max: 120 }),
      text("user_name", "Kullanıcı Adı", { required: true, max: 40 }),
      { name: "email", label: "E-posta", type: "email", required: true, max: 160 },
      { name: "role", label: "Rol", type: "select", required: true, options: ROLES.map((r) => ({ value: r, label: r === "admin" ? "Yönetici" : r === "editor" ? "Editör" : "İzleyici" })) },
      text("password", "Şifre", { secret: true, max: PASSWORD_MAX, help: `En az ${PASSWORD_MIN} karakter. Düzenlerken boş bırakırsanız değişmez.` }),
    ],
    listColumns: ["full_name", "user_name", "email", "role"],
    beforeSave: async (d, { id }) => {
      const dup = async (col: "email" | "user_name", val: unknown) => {
        const r = await query<{ id: number }>(`SELECT "id" FROM "users" WHERE "${col}" = ? AND "id" != ? LIMIT 1`, [String(val), id ?? 0]);
        return r.rows.length > 0;
      };
      if (await dup("email", d.email)) return { error: "Bu e-posta zaten kayıtlı." };
      if (await dup("user_name", d.user_name)) return { error: "Bu kullanıcı adı zaten kayıtlı." };
      const pw = String(d.password ?? "");
      if (!id && !pw) return { error: "Şifre zorunludur." };
      if (pw) {
        if (pw.length < PASSWORD_MIN || pw.length > PASSWORD_MAX) return { error: `Şifre ${PASSWORD_MIN}-${PASSWORD_MAX} karakter olmalı.` };
        if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return { error: "Şifre en az bir harf ve bir rakam içermeli." };
        return { data: { ...d, password: await hashPassword(pw), failed_attempts: 0, locked_until: null } };
      }
      const rest = { ...d };
      delete rest.password;
      return { data: rest };
    },
    canDelete: async (row, actorId) => (row.id === actorId ? "Kendi hesabınızı silemezsiniz." : null),
  },
];

export const MODULE_MAP = new Map(MODULES.map((m) => [m.key, m]));
export const getModule = (key: string) => MODULE_MAP.get(key) ?? null;
