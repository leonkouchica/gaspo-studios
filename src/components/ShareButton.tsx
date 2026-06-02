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
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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
      email: `mailto:?subject=${encodedTitle}&body=${encodedSummary}%0A%0A${encodedUrl}`,
    };

    window.open(urls[platform], "_blank", "noopener,noreferrer,width=600,height=400");
    setOpen(false);
  };

  const options: ShareOption[] = [
    { label: "Copy Link", icon: copied ? Check : Copy, color: "hover:bg-muted", action: copyLink },
    { label: "Twitter / X", icon: TwitterXIcon as any, color: "hover:bg-black hover:text-white", action: () => shareTo("twitter") },
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
