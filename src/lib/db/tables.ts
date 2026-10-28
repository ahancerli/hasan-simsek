import "server-only";
import { repo } from "./repo";

/**
 * Mevcut (taşınmış) D1 şemasının tablo/kolon beyaz listesi.
 * `npm run db:verify` bu listeyi canlı D1 şemasıyla karşılaştırır.
 */
const base = ["rank", "isActive", "createdAt"] as const;

export const settings = repo({
  table: "settings",
  columns: [
    "company_name", "slogan", "working_hours", "phone_1", "phone_2", "fax_1", "fax_2", "address",
    "about_us", "mission", "vision", "email", "meta_description", "meta_keywords",
    "facebook", "twitter", "instagram", "linkedin", "logo", "favicon", "footer_logo", "updatedAt",
  ],
});
export const slides = repo({
  table: "slides",
  columns: ["title", "description", "button_caption", "button_url", "allowButton", "img_url", ...base],
});
export const portfolios = repo({
  table: "portfolios",
  columns: ["title", "description", "url", "category_id", "client", "place", "finishedAt", "portfolio_url", ...base],
});
export const portfolioCategories = repo({ table: "portfolio_categories", columns: ["title", ...base] });
export const portfolioImages = repo({
  table: "portfolio_images",
  columns: ["portfolio_id", "img_url", "isCover", ...base],
});
export const references = repo({ table: "references", columns: ["title", "description", "img_url", ...base] });
export const brands = repo({ table: "brands", columns: ["title", "img_url", ...base] });
export const services = repo({ table: "services", columns: ["title", "description", "url", "img_url", ...base] });
export const products = repo({ table: "products", columns: ["title", "description", "url", ...base] });
export const productImages = repo({ table: "product_images", columns: ["product_id", "img_url", "isCover", ...base] });
export const news = repo({
  table: "news",
  columns: ["title", "description", "url", "news_type", "img_url", "video_url", ...base],
});
export const courses = repo({
  table: "courses",
  columns: ["title", "description", "url", "event_date", "img_url", ...base],
});
export const testimonials = repo({
  table: "testimonials",
  columns: ["title", "full_name", "company", "description", "img_url", ...base],
});
export const popups = repo({
  table: "popups",
  columns: ["title", "description", "page", "popup_uniq_id", "isActive", "createdAt"],
});
export const galleries = repo({
  table: "galleries",
  columns: ["title", "gallery_type", "url", "folder_name", ...base],
});
export const galleryImages = repo({ table: "images", columns: ["gallery_id", "url", ...base] });
export const galleryFiles = repo({ table: "files", columns: ["gallery_id", "url", ...base] });
export const galleryVideos = repo({ table: "videos", columns: ["gallery_id", "url", ...base] });
export const users = repo({
  table: "users",
  columns: [
    "user_name", "full_name", "email", "password", "role", "isActive", "createdAt",
    "failed_attempts", "locked_until", "last_login_at",
  ],
});

// ── Yeni tablolar (migrations/0001_security_seo.sql) ──
export const seoMeta = repo({
  table: "seo_meta",
  columns: ["scope", "ref", "title", "description", "keywords", "og_image", "canonical", "noindex", "updatedAt"],
});
export const contactMessages = repo({
  table: "contact_messages",
  columns: ["name", "email", "phone", "subject", "message", "ip", "mail_sent", "createdAt"],
});
export const auditLogs = repo({
  table: "audit_logs",
  columns: ["user_id", "action", "entity", "entity_id", "ip", "createdAt"],
});
export const passwordResets = repo({
  table: "password_resets",
  columns: ["user_id", "token_hash", "expires_at", "used", "createdAt"],
});
