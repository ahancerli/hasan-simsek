import type { Metadata } from "next";
import { PageTitle } from "@/components/site/PageTitle";
import { getGalleryVideos } from "@/lib/data";
import { parseVideo } from "@/lib/video";
import { buildMetadata } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({ scope: "page", ref: "video-gallery", path: "/video-galerimiz", fallbackTitle: "Video Galerimiz" });

export default async function VideoGalleryPage() {
  const videos = (await getGalleryVideos()).map((v) => ({ id: v.id, embed: parseVideo(v.url) })).filter((v) => v.embed);
  return (
    <>
      <PageTitle title="Video Galerimiz" crumbs={[{ label: "Video Galerisi" }]} />
      <section className="py-16 md:py-24"><div className="container">
        {videos.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {videos.map((v, n) => (
              <div key={v.id} className="aspect-video overflow-hidden rounded-xl bg-black shadow-card">
                <iframe title={`Video ${n + 1}`} src={v.embed!.src} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups" className="size-full border-0" />
              </div>
            ))}
          </div>
        ) : <p className="text-center text-ink-500">Henüz video eklenmemiş.</p>}
      </div></section>
    </>
  );
}
