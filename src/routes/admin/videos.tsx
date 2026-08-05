import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Youtube,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  ExternalLink,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle2,
  Edit2,
  X,
  Tv2,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchAllYouTubeVideosAdmin,
  upsertYouTubeVideo,
  deleteYouTubeVideo,
  toggleVideoVisibility,
  toggleVideoFeatured,
  fetchChannelSettings,
  updateChannelSettings,
  extractYouTubeId,
  getYouTubeThumbnail,
  type YouTubeVideo,
  type ChannelSettings,
  type VideoCategory,
  type VideoPlacement,
} from "../../lib/actions/videos";

export const Route = createFileRoute("/admin/videos")({
  component: AdminVideosPage,
});

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const CATEGORIES: VideoCategory[] = ["General", "Weddings", "Events", "Corporate", "BTS"];
const PLACEMENTS: { value: VideoPlacement; label: string }[] = [
  { value: "homepage", label: "Homepage" },
  { value: "gallery", label: "Gallery" },
  { value: "about", label: "About" },
];

// ─── EMPTY FORM STATE ─────────────────────────────────────────────────────────

const emptyForm = {
  id: undefined as string | undefined,
  url: "",
  videoId: "",
  title: "",
  category: "General" as VideoCategory,
  placements: [] as VideoPlacement[],
  featured: false,
  visible: true,
  sortOrder: 0,
};

// ─── CATEGORY BADGE ──────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    General: "bg-muted text-muted-foreground border-border",
    Weddings: "bg-pink-50 text-pink-700 border-pink-200",
    Events: "bg-violet-50 text-violet-700 border-violet-200",
    Corporate: "bg-blue-50 text-blue-700 border-blue-200",
    BTS: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${colors[category] ?? colors.General}`}
    >
      {category}
    </span>
  );
}

// ─── PLACEMENT CHIPS ─────────────────────────────────────────────────────────

function PlacementChips({ placements }: { placements: string[] }) {
  const colors: Record<string, string> = {
    homepage: "bg-emerald-50 text-emerald-700 border-emerald-200",
    gallery: "bg-blue-50 text-blue-700 border-blue-200",
    about: "bg-violet-50 text-violet-700 border-violet-200",
  };
  return (
    <div className="flex flex-wrap gap-1">
      {placements.map((p) => (
        <span
          key={p}
          className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${colors[p] ?? "bg-muted text-muted-foreground border-border"}`}
        >
          {p}
        </span>
      ))}
      {placements.length === 0 && (
        <span className="text-xs text-muted-foreground italic">None</span>
      )}
    </div>
  );
}

// ─── VIDEO FORM ───────────────────────────────────────────────────────────────

interface VideoFormProps {
  initial?: typeof emptyForm;
  onSave: (video: YouTubeVideo) => void;
  onCancel: () => void;
}

function VideoForm({ initial, onSave, onCancel }: VideoFormProps) {
  const [form, setForm] = useState(initial ?? emptyForm);
  const [saving, setSaving] = useState(false);
  const [previewId, setPreviewId] = useState(initial?.videoId ?? "");
  const [urlError, setUrlError] = useState("");

  const handleUrlChange = (url: string) => {
    setForm((f) => ({ ...f, url }));
    setUrlError("");
    const extracted = extractYouTubeId(url);
    if (url && !extracted) {
      setUrlError("Could not find a valid YouTube video ID in this URL.");
      setPreviewId("");
      setForm((f) => ({ ...f, videoId: "" }));
    } else if (extracted) {
      setPreviewId(extracted);
      setForm((f) => ({ ...f, videoId: extracted }));
    } else {
      setPreviewId("");
    }
  };

  const togglePlacement = (p: VideoPlacement) => {
    setForm((f) => ({
      ...f,
      placements: f.placements.includes(p)
        ? f.placements.filter((x) => x !== p)
        : [...f.placements, p],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.videoId) {
      setUrlError("Please enter a valid YouTube URL.");
      return;
    }
    if (form.placements.length === 0) {
      toast.error("Please select at least one placement.");
      return;
    }
    setSaving(true);
    try {
      const result = await upsertYouTubeVideo({ data: form as any });
      onSave(result as YouTubeVideo);
      toast.success(form.id ? "Video updated." : "Video added successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save video.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-border rounded-2xl p-6 space-y-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-dark text-lg">
          {form.id ? "Edit Video" : "Add New Video"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="w-8 h-8 rounded-full bg-muted hover:bg-border flex items-center justify-center text-muted-foreground transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* URL input */}
      <div>
        <label className="block text-sm font-medium text-dark mb-1.5">
          YouTube URL <span className="text-primary">*</span>
        </label>
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={form.url}
          onChange={(e) => handleUrlChange(e.target.value)}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${urlError ? "border-red-400" : "border-border"}`}
        />
        {urlError && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {urlError}
          </p>
        )}
        {form.videoId && !urlError && (
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 size={12} /> Video ID extracted: <code className="font-mono">{form.videoId}</code>
          </p>
        )}
      </div>

      {/* Live thumbnail preview */}
      {previewId && (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-dark">
          <img
            src={getYouTubeThumbnail(previewId, "hqdefault")}
            alt="Video preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-dark/30 flex items-center justify-center">
            <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
              <Youtube size={22} className="text-white" />
            </div>
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${previewId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 bg-dark/60 hover:bg-dark text-white rounded-lg px-2 py-1 text-xs flex items-center gap-1 transition-colors"
          >
            Open <ExternalLink size={10} />
          </a>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-dark mb-1.5">
          Title / Label <span className="text-primary">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Wedding Highlight Reel – Ade & Temi"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          maxLength={200}
          className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </div>

      {/* Category + Sort order row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-1.5">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as VideoCategory }))}
            className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark mb-1.5">Sort Order</label>
          <input
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
            className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      {/* Placements */}
      <div>
        <label className="block text-sm font-medium text-dark mb-2">
          Page Placements <span className="text-primary">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {PLACEMENTS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => togglePlacement(value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                form.placements.includes(value)
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-dark border-border hover:border-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div
            onClick={() => setForm((f) => ({ ...f, visible: !f.visible }))}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${form.visible ? "bg-primary" : "bg-border"}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.visible ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm font-medium text-dark">Visible</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div
            onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${form.featured ? "bg-amber-500" : "bg-border"}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.featured ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm font-medium text-dark">Featured</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || !form.videoId || !form.title}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {form.id ? "Update Video" : "Add Video"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 bg-muted hover:bg-border text-dark rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── CHANNEL TAB ─────────────────────────────────────────────────────────────

function ChannelTab() {
  const [settings, setSettings] = useState<ChannelSettings>({
    channelUrl: "",
    showSubscribeBanner: false,
    bannerText: "Watch more behind the scenes on our YouTube channel",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchChannelSettings().then((data) => {
      setSettings(data as ChannelSettings);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateChannelSettings({ data: settings });
      toast.success("Channel settings saved.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground py-12">
        <Loader2 size={18} className="animate-spin text-primary" />
        <p className="text-sm">Loading channel settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
            <Tv2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-dark">YouTube Channel</h3>
            <p className="text-xs text-muted-foreground">Link your channel and control the subscribe CTA</p>
          </div>
        </div>

        {/* Channel URL */}
        <div>
          <label className="block text-sm font-medium text-dark mb-1.5">Channel URL</label>
          <input
            type="url"
            placeholder="https://www.youtube.com/@GaspoStudios"
            value={settings.channelUrl}
            onChange={(e) => setSettings((s) => ({ ...s, channelUrl: e.target.value }))}
            className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          {settings.channelUrl && (
            <a
              href={settings.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
            >
              Open channel <ExternalLink size={10} />
            </a>
          )}
        </div>

        {/* Subscribe banner toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-dark">Show Subscribe Banner</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Display a "Watch on YouTube" CTA strip at the bottom of the video section on the homepage
            </p>
          </div>
          <div
            onClick={() => setSettings((s) => ({ ...s, showSubscribeBanner: !s.showSubscribeBanner }))}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${settings.showSubscribeBanner ? "bg-primary" : "bg-border"}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.showSubscribeBanner ? "translate-x-6" : "translate-x-0.5"}`} />
          </div>
        </div>

        {/* Banner text */}
        {settings.showSubscribeBanner && (
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5">Banner Text</label>
            <input
              type="text"
              maxLength={200}
              value={settings.bannerText}
              onChange={(e) => setSettings((s) => ({ ...s, bannerText: e.target.value }))}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Channel Settings
        </button>
      </div>

      {/* Preview */}
      {settings.showSubscribeBanner && settings.channelUrl && (
        <div className="bg-dark rounded-2xl p-5 flex items-center justify-between gap-4 border border-border-dark">
          <div className="flex items-center gap-3">
            <Youtube size={22} className="text-red-500 shrink-0" />
            <p className="text-white text-sm font-medium">{settings.bannerText}</p>
          </div>
          <a
            href={settings.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors shrink-0"
          >
            Subscribe
          </a>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

function AdminVideosPage() {
  const [tab, setTab] = useState<"videos" | "channel">("videos");
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<typeof emptyForm | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllYouTubeVideosAdmin();
      setVideos(data as YouTubeVideo[]);
    } catch (err: any) {
      toast.error(err.message || "Failed to load videos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "videos") loadVideos();
  }, [tab, loadVideos]);

  const handleSaved = (video: YouTubeVideo) => {
    setShowForm(false);
    setEditTarget(undefined);
    setVideos((prev) => {
      const exists = prev.find((v) => v.id === video.id);
      return exists ? prev.map((v) => (v.id === video.id ? video : v)) : [video, ...prev];
    });
  };

  const handleEdit = (video: YouTubeVideo) => {
    setEditTarget({
      id: video.id,
      url: video.url,
      videoId: video.videoId,
      title: video.title,
      category: video.category as VideoCategory,
      placements: video.placements as VideoPlacement[],
      featured: video.featured,
      visible: video.visible,
      sortOrder: video.sortOrder,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this video? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteYouTubeVideo({ data: { id } });
      setVideos((prev) => prev.filter((v) => v.id !== id));
      toast.success("Video deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete video.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleVisible = async (video: YouTubeVideo) => {
    try {
      const updated = await toggleVideoVisibility({ data: { id: video.id, visible: !video.visible } });
      setVideos((prev) => prev.map((v) => (v.id === video.id ? (updated as YouTubeVideo) : v)));
    } catch (err: any) {
      toast.error(err.message || "Failed to update visibility.");
    }
  };

  const handleToggleFeatured = async (video: YouTubeVideo) => {
    try {
      const updated = await toggleVideoFeatured({ data: { id: video.id, featured: !video.featured } });
      setVideos((prev) => prev.map((v) => (v.id === video.id ? (updated as YouTubeVideo) : v)));
    } catch (err: any) {
      toast.error(err.message || "Failed to update featured status.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark flex items-center gap-3">
            <Youtube size={26} className="text-red-500" />
            YouTube Videos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage embedded YouTube videos across the website and channel settings.
          </p>
        </div>
        {tab === "videos" && !showForm && (
          <button
            onClick={() => { setEditTarget(undefined); setShowForm(true); }}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors shrink-0"
          >
            <Plus size={16} /> Add Video
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {(["videos", "channel"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setShowForm(false); setEditTarget(undefined); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? "bg-white text-dark shadow-sm" : "text-muted-foreground hover:text-dark"
            }`}
          >
            {t === "videos" ? "Videos" : "Channel"}
          </button>
        ))}
      </div>

      {/* ── VIDEOS TAB ── */}
      {tab === "videos" && (
        <div className="space-y-6">
          {/* Add/Edit form */}
          {showForm && (
            <VideoForm
              initial={editTarget}
              onSave={handleSaved}
              onCancel={() => { setShowForm(false); setEditTarget(undefined); }}
            />
          )}

          {/* Video list */}
          {loading ? (
            <div className="flex items-center gap-3 text-muted-foreground py-12">
              <Loader2 size={18} className="animate-spin text-primary" />
              <p className="text-sm">Loading videos…</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-2xl">
              <Youtube size={40} className="mx-auto mb-3 opacity-30 text-primary" />
              <p className="font-semibold text-dark">No videos yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Add Video" to embed your first YouTube video.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[96px_1fr_auto] gap-0 divide-y divide-border">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="contents group"
                  >
                    {/* Thumbnail */}
                    <div className="p-4 flex items-center">
                      <div className="relative w-20 aspect-video rounded-lg overflow-hidden bg-dark shrink-0">
                        <img
                          src={getYouTubeThumbnail(video.videoId, "mqdefault")}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {!video.visible && (
                          <div className="absolute inset-0 bg-dark/60 flex items-center justify-center">
                            <EyeOff size={14} className="text-white/70" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <p className="font-semibold text-dark text-sm leading-tight line-clamp-2 flex-1 min-w-0">
                          {video.title || <span className="text-muted-foreground italic">Untitled</span>}
                        </p>
                        {video.featured && (
                          <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold shrink-0">
                            ★ Featured
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <CategoryBadge category={video.category} />
                        <PlacementChips placements={video.placements} />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-2">
                        ID: {video.videoId}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="p-4 flex flex-col md:flex-row items-end md:items-center gap-2">
                      {/* Toggle visible */}
                      <button
                        onClick={() => handleToggleVisible(video)}
                        title={video.visible ? "Hide" : "Show"}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          video.visible
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-muted text-muted-foreground hover:bg-border"
                        }`}
                      >
                        {video.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>

                      {/* Toggle featured */}
                      <button
                        onClick={() => handleToggleFeatured(video)}
                        title={video.featured ? "Unfeature" : "Feature"}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          video.featured
                            ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                            : "bg-muted text-muted-foreground hover:bg-border"
                        }`}
                      >
                        {video.featured ? <Star size={15} /> : <StarOff size={15} />}
                      </button>

                      {/* Open on YouTube */}
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open on YouTube"
                        className="w-8 h-8 rounded-lg bg-muted text-muted-foreground hover:bg-border flex items-center justify-center transition-colors"
                      >
                        <ExternalLink size={15} />
                      </a>

                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(video)}
                        title="Edit"
                        className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(video.id)}
                        disabled={deletingId === video.id}
                        title="Delete"
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 flex items-center justify-center transition-colors"
                      >
                        {deletingId === video.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CHANNEL TAB ── */}
      {tab === "channel" && <ChannelTab />}
    </div>
  );
}
