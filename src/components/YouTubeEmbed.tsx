import { useState, useRef, useCallback } from "react";
import { Play } from "lucide-react";
import { getYouTubeThumbnail } from "../lib/actions/videos";

interface YouTubeEmbedProps {
  /** YouTube video ID (11-character string). */
  videoId: string;
  /** Accessible title for the iframe. */
  title: string;
  /** Optional class applied to the outer wrapper div. */
  className?: string;
  /** If true, renders the iframe immediately rather than a click-to-play thumbnail. */
  autoLoad?: boolean;
}

/**
 * YouTubeEmbed — a privacy-enhanced, lazy-loading YouTube embed component.
 *
 * Renders a thumbnail with a play button overlay. On click, replaces the
 * thumbnail with the actual YouTube iframe to avoid loading YouTube scripts
 * until the user interacts (better performance & privacy).
 *
 * Uses youtube-nocookie.com domain for enhanced privacy (no cookies until play).
 */
export function YouTubeEmbed({ videoId, title, className = "", autoLoad = false }: YouTubeEmbedProps) {
  const [active, setActive] = useState(autoLoad);
  const containerRef = useRef<HTMLDivElement>(null);

  const activate = useCallback(() => setActive(true), []);

  const thumbnailUrl = getYouTubeThumbnail(videoId, "hqdefault");
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video bg-dark rounded-2xl overflow-hidden group ${className}`}
    >
      {active ? (
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full border-0"
        />
      ) : (
        <button
          onClick={activate}
          aria-label={`Play video: ${title}`}
          className="absolute inset-0 w-full h-full cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {/* Thumbnail */}
          <img
            src={thumbnailUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              // Fall back to lower-quality thumbnail if maxres unavailable
              const img = e.target as HTMLImageElement;
              if (img.src.includes("hqdefault")) {
                img.src = getYouTubeThumbnail(videoId, "mqdefault");
              }
            }}
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-dark/40 group-hover:bg-dark/50 transition-colors" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <Play size={28} fill="white" className="text-white ml-1" />
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
