import { useState } from "react";
import { X, Play } from "lucide-react";
import type { YouTubeVideo } from "../lib/actions/videos";
import { getYouTubeThumbnail } from "../lib/actions/videos";
import { YouTubeEmbed } from "./YouTubeEmbed";

interface VideoGridProps {
  /** List of YouTube video objects to display. */
  videos: YouTubeVideo[];
  /** Optional class applied to the grid wrapper. */
  className?: string;
}

/**
 * VideoGrid — renders a responsive grid of YouTube video thumbnail cards.
 *
 * Clicking a card opens it in a full-screen lightbox modal, consistent with
 * the gallery photo lightbox design pattern.
 */
export function VideoGrid({ videos, className = "" }: VideoGridProps) {
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>("");

  const openLightbox = (videoId: string, title: string) => {
    setLightboxId(videoId);
    setLightboxTitle(title);
  };

  const closeLightbox = () => {
    setLightboxId(null);
    setLightboxTitle("");
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-2xl max-w-md mx-auto p-8">
        <Play size={40} className="mx-auto mb-3 opacity-30 text-primary" />
        <p className="font-semibold text-dark text-sm">No Videos Found</p>
        <p className="text-xs mt-1">There are no videos published in this category yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() => openLightbox(video.videoId, video.title)}
            aria-label={`Play: ${video.title}`}
            className="group relative aspect-video bg-dark rounded-2xl overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary"
          >
            {/* Thumbnail */}
            <img
              src={getYouTubeThumbnail(video.videoId, "hqdefault")}
              alt={video.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-dark/40 group-hover:bg-dark/55 transition-colors" />

            {/* Category chip */}
            <div className="absolute top-3 left-3 bg-primary/20 border border-primary/30 text-primary rounded-lg px-2.5 py-1 text-xs font-bold">
              {video.category}
            </div>

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Play size={24} fill="white" className="text-white ml-1" />
              </div>
            </div>

            {/* Title overlay at bottom */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-dark/90 to-transparent translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <p className="text-white font-semibold text-sm line-clamp-2 text-left">{video.title}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxId && (
        <div
          className="fixed inset-0 z-[60] bg-dark/95 flex items-center justify-center p-4 md:p-8"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-primary text-white flex items-center justify-center transition-colors z-10"
            onClick={closeLightbox}
            aria-label="Close video"
          >
            <X size={20} />
          </button>

          <div
            className="w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <YouTubeEmbed
              videoId={lightboxId}
              title={lightboxTitle}
              autoLoad
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
