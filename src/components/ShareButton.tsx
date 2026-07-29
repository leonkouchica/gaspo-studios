// src/components/ShareButton.tsx
// A share button that uses the Web Share API on mobile (native share sheet)
// and shows a popover with social media + clipboard options on desktop.

import { useState, useRef, useEffect } from "react";
import {
  Share2,
  Copy,
  Check,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────

interface ShareButtonProps {
  title: string;
  url?: string;
  summary?: string;
  variant?: "icon" | "text" | "dark";
  className?: string;
}

interface ShareOption {
  label: string;
  icon: LucideIcon;
  color: string;
  action: () => void;
}

// ── Social SVG icons (inline to avoid extra dependencies) ────────────────────

function TwitterXIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.813 5.813 0 0 0-.571-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function ThreadsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.708C154.894 45.698 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.194473 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" fill="currentColor"></path>
    </svg>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export function ShareButton({
  title,
  url,
  summary,
  variant = "icon",
  className = "",
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareSummary = summary || title;

  // Close popover on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleClick = async () => {
    // Mobile: use native Web Share API
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareSummary, url: shareUrl });
        return;
      } catch {
        // User cancelled — fall through to popover
      }
    }
    // Desktop: toggle popover
    setOpen((v) => !v);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
      setTimeout(() => setOpen(false), 1500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareTo = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedSummary = encodeURIComponent(shareSummary);

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      threads: `https://threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedSummary}%0A%0A${encodedUrl}`,
    };

    window.open(urls[platform], "_blank", "noopener,noreferrer,width=600,height=400");
    setOpen(false);
  };

  const options: ShareOption[] = [
    { label: "Copy Link", icon: copied ? Check : Copy, color: "hover:bg-muted", action: copyLink },
    { label: "Twitter / X", icon: TwitterXIcon as any, color: "hover:bg-black hover:text-white", action: () => shareTo("twitter") },
    { label: "Threads", icon: ThreadsIcon as any, color: "hover:bg-black hover:text-white", action: () => shareTo("threads") },
    { label: "Facebook", icon: FacebookIcon as any, color: "hover:bg-[#1877F2] hover:text-white", action: () => shareTo("facebook") },
    { label: "LinkedIn", icon: LinkedInIcon as any, color: "hover:bg-[#0A66C2] hover:text-white", action: () => shareTo("linkedin") },
    { label: "WhatsApp", icon: WhatsAppIcon as any, color: "hover:bg-[#25D366] hover:text-white", action: () => shareTo("whatsapp") },
    { label: "Email", icon: Share2, color: "hover:bg-muted", action: () => shareTo("email") },
  ];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={handleClick}
        className={
          variant === "dark"
            ? `w-11 h-11 rounded-full border border-white/30 text-white hover:bg-white/10 flex items-center justify-center transition-all ${className ?? ""}`
            : variant === "text"
              ? `inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-dark transition-colors ${className ?? ""}`
              : `w-10 h-10 rounded-full bg-muted text-dark flex items-center justify-center hover:bg-primary hover:text-white transition-colors ${className ?? ""}`
        }
        aria-label="Share"
      >
        <Share2 size={16} />
        {variant === "text" && <span>Share</span>}
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-52 bg-white rounded-2xl border border-border shadow-xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <p className="text-xs font-semibold text-muted-foreground px-3 py-1.5">Share via</p>
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.action}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark transition-colors ${opt.color}`}
            >
              <opt.icon size={16} />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
