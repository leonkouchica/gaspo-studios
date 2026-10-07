import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload,
  Search,
  Trash2,
  Eye,
  EyeOff,
  LayoutGrid,
  CheckCircle2,
  Loader2,
  RefreshCw,
  AlertCircle,
  X,
  Stamp,
} from "lucide-react";
import {
  fetchGalleryImages,
  toggleImageVisibility,
  deleteGalleryImage,
  rewatermarkGalleryImages,
  processGalleryUpload,
  getGalleryUploadUrl,
} from "../../../lib/actions/gallery";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/gallery/")({
  loader: async () => {
    const images = await fetchGalleryImages({ data: {} });
    return { images: (images || []) as GalleryImage[] };
  },
  component: AdminGalleryPage,
});

interface GalleryImage {
  id: string;
  src: string;
  title: string;
  alt: string;
  category: string;
  visible: boolean;
  order: number;
  uploadedAt: string;
}

const CATEGORIES = [
  "Weddings",
  "Corporate",
  "Portraits",
  "Events",
  "Fashion",
  "Studio",
  "Product",
  "Real Estate",
  "Other",
];

interface UploadQueueItem {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  status: "idle" | "uploading" | "processing" | "success" | "error";
  errorMessage?: string;
}

function UploadModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: (imgs: GalleryImage[] | GalleryImage) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadQueueItem[]>([]);
  const [category, setCategory] = useState("Weddings");
  const [uploading, setUploading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const addFiles = (files: FileList | File[]) => {
    const newItems: UploadQueueItem[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: Math.random().toString(36).substring(2, 9),
        file: f,
        previewUrl: URL.createObjectURL(f),
        title: f.name.replace(/\.[^/.]+$/, "").replace(/-|_/g, " "),
        status: "idle",
      }));

    setItems((prev) => [...prev, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  const removeItem = (id: string) => {
    if (uploading) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateTitle = (id: string, title: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, title } : it)));
  };

  const handleUpload = async () => {
    const pending = items.filter((it) => it.status !== "success");
    if (pending.length === 0) return toast.error("Please add at least one image to upload.");

    setUploading(true);
    const successfullyUploaded: GalleryImage[] = [];
    let failedCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.status === "success") continue;

      setCurrentIdx(i + 1);

      // Phase 1: get signed upload URL
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: "uploading" } : it)),
      );

      try {
        const { signedUrl, storagePath } = await getGalleryUploadUrl({
          data: { fileName: item.file.name },
        });

        // Phase 2: PUT raw file directly to storage
        const uploadRes = await fetch(signedUrl, {
          method: "PUT",
          body: item.file,
          headers: { "Content-Type": item.file.type },
        });

        if (!uploadRes.ok) {
          throw new Error(`Direct upload failed (${uploadRes.status})`);
        }

        // Phase 3: server converts to WebP, applies watermark, saves DB record
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: "processing" } : it)),
        );

        const result = await processGalleryUpload({
          data: {
            storagePath,
            fileName: item.file.name,
            title: item.title.trim() || item.file.name,
            alt: item.title.trim() || item.file.name,
            category,
          },
        });

        successfullyUploaded.push(result as GalleryImage);
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: "success" } : it)),
        );
      } catch (err: any) {
        failedCount++;
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: "error", errorMessage: err.message } : it,
          ),
        );
      }
    }

    setUploading(false);

    if (successfullyUploaded.length > 0) {
      onUploaded(successfullyUploaded);
      if (failedCount === 0) {
        toast.success(`Successfully uploaded and watermarked ${successfullyUploaded.length} images.`);
        onClose();
      } else {
        toast.warning(
          `Uploaded ${successfullyUploaded.length} images. ${failedCount} failed — please check errors.`,
        );
      }
    } else {
      toast.error("Upload failed for all selected images.");
    }
  };

  const completedCount = items.filter((it) => it.status === "success").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={uploading ? undefined : onClose} />
      <div className="relative bg-white border border-border shadow-2xl rounded-3xl w-full max-w-2xl p-6 space-y-5 z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
          <div>
            <h3 className="font-bold text-dark text-lg">Upload Images to Gallery</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select one or multiple images. Automatically converts to WebP and applies watermark.
            </p>
          </div>
          <button
            onClick={uploading ? undefined : onClose}
            disabled={uploading}
            className="w-8 h-8 rounded-lg bg-muted text-slate-500 hover:text-dark flex items-center justify-center disabled:opacity-50 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 flex-1 pr-1">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-2xl p-5 text-center text-muted-foreground cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors min-h-[120px] flex flex-col items-center justify-center"
          >
            <Upload size={24} className="mb-1.5 opacity-50 text-primary" />
            <p className="text-xs font-semibold text-dark">
              Click to browse or drop multiple images here
            </p>
            <p className="text-[11px] opacity-60 mt-0.5">
              JPG, PNG, WebP • Auto-watermarked with GASPO STUDIOS
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files);
            }}
          />

          {/* Category selection */}
          <div className="bg-slate-50 border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-dark block">Portfolio Category</label>
              <p className="text-[11px] text-muted-foreground">
                Applies to all images in this upload batch
              </p>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={uploading}
              className="bg-white border border-border rounded-xl px-3 py-2 text-xs font-medium focus:border-primary outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Selected queue */}
          {items.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-dark px-1">
                <span>
                  Selected Images ({items.length})
                </span>
                {completedCount > 0 && (
                  <span className="text-green-600 font-semibold">
                    {completedCount} of {items.length} completed
                  </span>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    <img
                      src={it.previewUrl}
                      alt={it.title}
                      className="w-12 h-12 rounded-lg object-cover border border-border shrink-0 bg-muted"
                    />

                    <div className="flex-1 min-w-0">
                      <input
                        value={it.title}
                        onChange={(e) => updateTitle(it.id, e.target.value)}
                        disabled={uploading || it.status === "success"}
                        placeholder="Image title…"
                        className="w-full bg-transparent text-xs font-semibold text-dark outline-none border-b border-transparent focus:border-primary px-1 py-0.5"
                      />
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5 px-1">
                        <span>{(it.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                        <span>•</span>
                        {it.status === "idle" && (
                          <span className="text-slate-500">Ready</span>
                        )}
                        {it.status === "uploading" && (
                          <span className="text-blue-600 font-medium flex items-center gap-1">
                            <Loader2 size={10} className="animate-spin" /> Uploading to storage…
                          </span>
                        )}
                        {it.status === "processing" && (
                          <span className="text-amber-600 font-medium flex items-center gap-1">
                            <Loader2 size={10} className="animate-spin" /> Watermarking & WebP…
                          </span>
                        )}
                        {it.status === "success" && (
                          <span className="text-green-600 font-bold flex items-center gap-1">
                            <CheckCircle2 size={10} /> Completed
                          </span>
                        )}
                        {it.status === "error" && (
                          <span className="text-red-600 font-medium">
                            {it.errorMessage || "Failed"}
                          </span>
                        )}
                      </div>
                    </div>

                    {!uploading && it.status !== "success" && (
                      <button
                        type="button"
                        onClick={() => removeItem(it.id)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="pt-2 border-t border-border flex items-center gap-3 shrink-0">
          {items.length > 0 && !uploading && (
            <button
              type="button"
              onClick={() => setItems([])}
              className="text-xs text-muted-foreground hover:text-dark px-3 py-2"
            >
              Clear All
            </button>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || items.length === 0}
            className="flex-1 ml-auto bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Processing {currentIdx} of {items.length}…
              </>
            ) : (
              <>
                <Upload size={15} /> Upload {items.length} {items.length === 1 ? "Image" : "Images"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminGalleryPage() {
  const loaderData = Route.useLoaderData();
  const [images, setImages] = useState<GalleryImage[]>(loaderData?.images || []);
  const [loading, setLoading] = useState(!loaderData?.images);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [rewatermarking, setRewatermarking] = useState(false);

  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGalleryImages({ data: {} });
      setImages(data as GalleryImage[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loaderData?.images) {
      loadImages();
    }
  }, [loadImages, loaderData?.images]);

  const categories = Array.from(new Set(images.map((i) => i.category)));

  const filtered = images.filter((i) => {
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || i.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleToggleVisibility = async (img: GalleryImage) => {
    setTogglingId(img.id);
    try {
      const updated = await toggleImageVisibility({ data: { id: img.id, visible: !img.visible } });
      setImages((prev) => prev.map((i) => (i.id === img.id ? (updated as GalleryImage) : i)));
      toast.success(
        img.visible ? "Image hidden from public gallery." : "Image visible on public gallery.",
      );
    } catch (err: any) {
      toast.error(`Failed to toggle: ${err.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (img: GalleryImage) => {
    if (!confirm(`Delete "${img.title}"? This will permanently remove the image file.`)) return;
    setDeletingId(img.id);
    try {
      await deleteGalleryImage({ data: { id: img.id } });
      setImages((prev) => prev.filter((i) => i.id !== img.id));
      toast.success("Image deleted from gallery and storage.");
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Re-applies the GASPO STUDIOS watermark to every existing gallery image.
   * Downloads, watermarks, and re-uploads each file in place on the server.
   */
  const handleRewatermark = async () => {
    if (
      !confirm(
        `Apply GASPO STUDIOS watermark to all ${images.length} existing gallery image${images.length !== 1 ? "s" : ""}?\n\nThis will permanently overwrite the stored files. This action cannot be undone.`,
      )
    )
      return;

    setRewatermarking(true);
    const toastId = toast.loading(
      `Watermarking ${images.length} image${images.length !== 1 ? "s" : ""}… this may take a moment.`,
    );
    try {
      const result = await rewatermarkGalleryImages({ data: {} });
      if (result.failed === 0) {
        toast.success(
          `Watermark applied to all ${result.processed} image${result.processed !== 1 ? "s" : ""}.`,
          { id: toastId },
        );
      } else {
        toast.warning(
          `Watermarked ${result.processed}/${result.total} images. ${result.failed} failed — check server logs.`,
          { id: toastId },
        );
        console.warn("Rewatermark errors:", result.errors);
      }
    } catch (err: any) {
      toast.error(`Rewatermark failed: ${err.message}`, { id: toastId });
    } finally {
      setRewatermarking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Gallery Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? "Loading…" : `${images.length} total images in portfolio`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadImages()}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white border border-border text-dark rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handleRewatermark}
            disabled={rewatermarking || loading || images.length === 0}
            title="Apply GASPO STUDIOS watermark to all existing gallery images"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-3 py-2 text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {rewatermarking ? (
              <><Loader2 size={14} className="animate-spin" /> Watermarking…</>
            ) : (
              <><Stamp size={14} /> Watermark Existing</>
            )}
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105 cursor-pointer"
          >
            <Upload size={16} /> Upload Images
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-border px-3 py-2.5 text-sm bg-white focus:border-primary outline-none capitalize"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="bg-white rounded-xl border border-border p-1 flex gap-1">
          <button className="p-2 rounded-lg bg-muted text-dark">
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 size={32} className="animate-spin mb-4 text-primary" />
          <p className="text-sm">Loading gallery from Supabase…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-muted-foreground bg-white rounded-2xl border border-border border-dashed">
          <LayoutGrid size={40} className="mb-4 opacity-30" />
          <p className="text-sm font-medium">
            {search || categoryFilter !== "all"
              ? "No images match your filters."
              : "No images yet. Click Upload Images to add your first photo."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((img) => (
            <div
              key={img.id}
              className={`group relative rounded-2xl overflow-hidden border transition-all ${
                img.visible
                  ? "border-border hover:border-primary/50"
                  : "border-border opacity-50 hover:opacity-100"
              }`}
            >
              <div className="aspect-[4/3] bg-muted">
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => handleToggleVisibility(img)}
                    disabled={togglingId === img.id}
                    className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
                    title={img.visible ? "Hide from public gallery" : "Show in public gallery"}
                  >
                    {togglingId === img.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : img.visible ? (
                      <Eye size={14} />
                    ) : (
                      <EyeOff size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(img)}
                    disabled={deletingId === img.id}
                    className="w-8 h-8 rounded-lg bg-white/20 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
                    title="Delete image"
                  >
                    {deletingId === img.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm truncate">{img.title}</p>
                  <p className="text-white/70 text-xs mt-0.5 capitalize">{img.category}</p>
                </div>
              </div>
              {!img.visible && (
                <div className="absolute top-2 left-2 bg-dark/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                  Hidden
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && images.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>Supabase Storage Active:</strong> All uploaded images are automatically
            converted to WebP and stored in the{" "}
            <code className="bg-blue-100 px-1 rounded">gaspo-media/gallery</code> bucket.
            New uploads include the GASPO STUDIOS watermark. Use{" "}
            <strong>Watermark Existing</strong> to apply the watermark to previously uploaded images.
          </p>
        </div>
      )}

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUploaded={(uploaded) => {
            const list = Array.isArray(uploaded) ? uploaded : [uploaded];
            setImages((prev) => [...list, ...prev]);
          }}
        />
      )}
    </div>
  );
}
