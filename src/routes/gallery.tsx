import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { fetchGalleryImages } from "../lib/actions/gallery";
import { fetchYouTubeVideos, type YouTubeVideo } from "../lib/actions/videos";
import { VideoGrid } from "../components/VideoGrid";
import { toast } from "sonner";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Portfolio — Gaspo Studios" },
      {
        name: "description",
        content: "Explore our portfolio of weddings, portraits, commercial and event photography.",
      },
      { property: "og:title", content: "Portfolio — Gaspo Studios" },
      { property: "og:url", content: "/gallery" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: GalleryPage,
});

const categories = ["All", "Weddings", "Portraits", "Commercial", "Events", "Video"] as const;

interface GalleryItem {
  id: string;
  src: string;
  title: string;
  alt: string;
  category: string;
  visible: boolean;
  order: number;
}

function GalleryPage() {
  const [filter, setFilter] = useState<(typeof categories)[number]>("All");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);

  const loadGallery = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchGalleryImages({ data: { visibleOnly: true } });
      setItems(data as GalleryItem[]);
    } catch (err: any) {
      console.error("Failed to load gallery images:", err);
      toast.error(err.message || "Failed to load gallery images. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVideos = useCallback(async () => {
    setVideosLoading(true);
    try {
      const data = await fetchYouTubeVideos({ data: { placement: "gallery" } });
      setVideos(data as YouTubeVideo[]);
    } catch {
      // Videos unavailable — show empty state
    } finally {
      setVideosLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  useEffect(() => {
    if (filter === "Video") loadVideos();
  }, [filter, loadVideos]);

  const visible =
    filter === "All"
      ? items
      : items.filter((i) => i.category.toLowerCase() === filter.toLowerCase());

  // Distribute aspects nicely based on index to create a masonry look
  const getAspectClass = (index: number) => {
    const aspects = [
      "aspect-[4/5]",
      "aspect-square",
      "aspect-[3/2]",
      "aspect-[4/3]",
      "aspect-[16/9]",
      "aspect-[9/16]",
    ];
    return aspects[index % aspects.length];
  };

  return (
    <>
      <PageHeader
        title="Our Portfolio"
        crumb="Gallery"
        subtitle="Explore our collection of weddings, portraits, and commercial work."
        image="/images/photographer_hero.webp"
      />

      <section className="py-12">
        <div className="container-x">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-all cursor-pointer ${
                  filter === c
                    ? "bg-primary text-white"
                    : "bg-white text-dark border border-border hover:border-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="container-x">
          {/* ── VIDEO TAB ── */}
          {filter === "Video" && (
            videosLoading ? (
              <div className="text-center py-20 text-muted-foreground">
                <Loader2 size={32} className="animate-spin mx-auto mb-3 text-primary" />
                <p className="text-sm">Loading videos…</p>
              </div>
            ) : (
              <VideoGrid videos={videos} />
            )
          )}

          {/* ── PHOTO TABS ── */}
          {filter !== "Video" && (
            loading ? (
              <div className="text-center py-20 text-muted-foreground">
                <Loader2 size={32} className="animate-spin mx-auto mb-3 text-primary" />
                <p className="text-sm">Loading portfolio images…</p>
              </div>
            ) : visible.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-2xl max-w-md mx-auto p-8">
                <ImageIcon size={40} className="mx-auto mb-3 opacity-30 text-primary" />
                <p className="font-semibold text-dark text-sm">No Images Found</p>
                <p className="text-xs mt-1">There are no images published in this category yet.</p>
              </div>
            ) : (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
                {visible.map((it, i) => (
                  <button
                    key={it.id}
                    onClick={() => setLightbox(it.src)}
                    onContextMenu={(e) => e.preventDefault()}
                    className={`mb-6 break-inside-avoid relative group block w-full rounded-2xl overflow-hidden cursor-zoom-in ${getAspectClass(i)}`}
                  >
                    <img
                      src={it.src}
                      alt={it.alt || it.title}
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-muted protected-image"
                    />
                    <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4">
                      <p className="uppercase text-xs tracking-[0.25em] text-primary">
                        {it.category}
                      </p>
                      <p className="font-bold text-base mt-2 text-center line-clamp-2">{it.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      </section>

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-dark/95 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        >
          <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-primary z-10">
            <X size={20} />
          </button>
          <img
            src={lightbox}
            alt=""
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            className="max-h-[90vh] max-w-full rounded-2xl protected-image"
          />
        </div>
      )}
    </>
  );
}
