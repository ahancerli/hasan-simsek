import type { Scope } from "@/lib/security/roles";
import type { Row, repo } from "@/lib/db/repo";

export type FieldType = "text" | "textarea" | "richtext" | "date" | "email" | "url" | "select" | "image" | "switch" | "number";

export type Option = { value: string; label: string };

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  max?: number;
  help?: string;
  placeholder?: string;
  /** select seçenekleri; "portfolio_categories" → DB'den */
  options?: Option[] | "portfolio_categories";
  /** image alanları: public/assets/uploads/<folder> */
  folder?: string;
  resolutions?: { w: number; h: number }[];
  /** yalnızca oluştururken düzenlenebilir */
  createOnly?: boolean;
  /** parola benzeri alan: type=password, HTML temizleme/trim yapılmaz */
  secret?: boolean;
};

export type Child = {
  key: string; // /admin/<module>/<id>/<key>
  label: string;
  kind: "image" | "file" | "video";
  table: "portfolio_images" | "product_images" | "images" | "files" | "videos";
  parentField: string;
  folder: string; // uploads/<folder>
  resolutions?: { w: number; h: number }[];
  /** "name": img_url dosya adı tutar; "path": url "uploads/..." göreli yol tutar */
  urlField: "img_url" | "url";
  urlMode: "name" | "path";
  cover?: boolean;
  /** galeri tiplerinde yalnızca belirli gallery_type için görünür */
  onlyForType?: string;
};

export type ModuleDef = {
  key: string;
  title: string;
  singular: string;
  icon: string; // lucide ikon adı (components/admin/icons.tsx)
  group: "İçerik" | "Medya" | "Sistem";
  scope: Scope;
  repo: ReturnType<typeof repo>;
  fields: Field[];
  listColumns: string[];
  sortable?: boolean;
  toggleActive?: boolean;
  slug?: { from: string; to: string };
  seo?: boolean;
  singleton?: boolean;
  children?: Child[];
  /** oluşturma sırasında eklenen sabit değerler */
  defaults?: () => Record<string, unknown>;
  /** doğrulanmış veriyi kaydetmeden önce dönüştürür veya reddeder */
  beforeSave?: (
    data: Record<string, unknown>,
    ctx: { id?: number; existing?: Row | null },
  ) => Promise<{ data: Record<string, unknown> } | { error: string }>;
  /** silmeden önce bağlı kayıt/dosya temizliği */
  beforeDelete?: (row: Row) => Promise<void>;
  /** silinmesini engelleyen kural */
  canDelete?: (row: Row, actorId: number) => Promise<string | null>;
};
