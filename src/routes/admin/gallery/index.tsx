import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload, Search, Trash2, Eye, EyeOff, LayoutGrid, CheckCircle2,
  Loader2, RefreshCw, AlertCircle, X
} from "lucide-react";
import { arrayBufferToBase64 } from "../../../lib/base64";
import {
  fetchGalleryImages,
  uploadGalleryImage,
  toggleImageVisibility,
  deleteGalleryImage,
} from "../../../lib/actions/gallery";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/gallery/")({
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
  "Product",
  "Real Estate",
  "Other",
];

function UploadModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: (img: GalleryImage) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Weddings");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/-|_/g, " "));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return toast.error("Please select an image.");
    if (!title.trim()) return toast.error("Please enter a title.");

    setUploading(true);
    try {
      // Read file as base64 to send via createServerFn validator
      const arrayBuffer = await selectedFile.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const result = await uploadGalleryImage({
        data: {
          fileBase64: base64,
          fileName: selectedFile.name,
          mimeType: selectedFile.type,
          title: title.trim(),
          alt: title.trim(),
          category,
        },
      });
      toast.success("Image uploaded and converted to WebP.");
      onUploaded(result as GalleryImage);
      onClose();
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-border shadow-2xl rounded-3xl w-full max-w-md p-6 space-y-5 z-10">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-dark">Upload to Gallery</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-muted text-slate-500 hover:text-dark flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-2xl p-6 text-center text-muted-foreground cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors min-h-[140px] flex flex-col items-center justify-center"
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="max-h-32 rounded-xl object-cover" />
          ) : (
            <>
              <Upload size={24} className="mb-2 opacity-50" />
              <p className="text-xs font-medium">Drop an image or click to browse</p>
              <p className="text-xs opacity-60 mt-1">Auto-converts to WebP at quality 90</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelect(f);
          }}
        />

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-dark block mb-1.5">Image Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Describe the image..."
              className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-dark block mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="w-full bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl py-3 text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {uploading ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Converting &amp; Uploading…
            </>
          ) : (
            <>
              <Upload size={15} /> Upload Image
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    loadImages();
  }, [loadImages]);

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
      toast.success(img.visible ? "Image hidden from public gallery." : "Image visible on public gallery.");
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
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105 cursor-pointer"
          >
            <Upload size={16} /> Upload Images
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
                <img src={img.src} alt={img.title} className="w-full h-full object-cover" loading="lazy" />
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
            <strong>Supabase Storage Active:</strong> All uploaded images are automatically converted to WebP and stored in the{" "}
            <code className="bg-blue-100 px-1 rounded">gaspo-media/gallery</code> bucket. Toggle visibility
            to show/hide images on the public gallery page.
          </p>
        </div>
      )}

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUploaded={(img) => setImages((prev) => [img, ...prev])}
        />
      )}
    </div>
  );
}
