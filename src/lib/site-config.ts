/** Eski PHP Home controller'ındaki sabit kategori kimlikleri (plain=4, next=1, complate=2). */
export const PROJECT_STATUS = {
  planned: { categoryId: 4, label: "Planlanan Projeler", path: "/planlanan-projeler", seo: "projects-planned" },
  ongoing: { categoryId: 1, label: "Devam Eden Projeler", path: "/devam-eden-projeler", seo: "projects-ongoing" },
  completed: { categoryId: 2, label: "Tamamlanan Projeler", path: "/tamamlanan-projeler", seo: "projects-completed" },
} as const;
export type ProjectStatus = keyof typeof PROJECT_STATUS;

export const CONTENT_TAG = "content";
