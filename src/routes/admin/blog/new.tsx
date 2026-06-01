import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { ChevronLeft, Save, Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { createBlogPost, uploadBlogImage } from "../../../lib/actions/blog";
import RichTextEditor from "../../../components/RichTextEditor";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/blog/new")({
  component: NewBlogPostPage,
});

const CATEGORIES = [
  "Photography Tips",
  "Weddings",
  "Studio News",
  "Gear Review",
  "Business",
  "Events",
  "Behind the Scenes",
];

function NewBlogPostPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    category: "",
    status: "draft" as "draft" | "published" | "scheduled",
    featuredImage: "",
    tags: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (f: string, v: string) => setForm((s) => ({ ...s, [f]: v }));

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const result = await uploadBlogImage({
        data: { fileBase64: base64, fileName: file.name, mimeType: file.type },
      });
      set("featuredImage", (result as any).url);
      toast.success("Image uploaded and converted to WebP.");
    } catch (err: any) {
      toast.error(`Image upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Title is required.");
    if (!form.excerpt.trim()) return toast.error("Excerpt is required.");
    if (!form.body.trim()) return toast.error("Content is required.");
    if (!form.category) return toast.error("Please select a category.");

    const slug =
      form.slug.trim() ||
      form.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    setSaving(true);
    try {
      await createBlogPost({
        data: {
          slug,
          title: form.title.trim(),
          excerpt: form.excerpt.trim(),
          body: form.body.trim(),
          category: form.category,
          tags: form.tags
            ? form.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
          featuredImage: form.featuredImage || "/images/blog_placeholder.webp",
          status: form.status,
        },
      });
      toast.success(`Post "${form.title}" saved as ${form.status}.`);
      navigate({ to: "/admin/blog" });
    } catch (err: any) {
      toast.error(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link
          to="/admin/blog"
          className="w-9 h-9 rounded-xl border border-border bg-white hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-dark transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-dark">Create Post</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Write a new article for the blog.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="ml-auto inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Saving…" : "Save Post"}
        </button>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
            <div>
              <label className="text-sm font-semibold text-dark block mb-1.5">Title *</label>
              <input
                value={form.title}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!form.slug) {
                    set(
                      "slug",
                      e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, "")
                    );
                  }
                }}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary outline-none"
                placeholder="Post title..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-dark block mb-1.5">Content *</label>
              <textarea
                value={form.body}
                onChange={(e) => set("body", e.target.value)}
                rows={16}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary outline-none resize-none"
                placeholder="Write your post content here (Markdown supported)..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-dark block mb-1.5">Excerpt *</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary outline-none resize-none"
                placeholder="A brief summary for the blog index..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-dark block mb-1.5">Tags</label>
              <input
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary outline-none"
                placeholder="Photography, Wedding, Tips (comma-separated)"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
            <h3 className="font-semibold text-dark">Settings</h3>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2 text-sm focus:border-primary outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2 text-sm focus:border-primary outline-none"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">URL Slug</label>
              <input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2 text-sm focus:border-primary outline-none"
                placeholder="auto-generated from title"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-dark">Featured Image</h3>
            {form.featuredImage ? (
              <div className="relative">
                <img src={form.featuredImage} alt="Featured" className="w-full h-40 object-cover rounded-xl" />
                <button
                  onClick={() => set("featuredImage", "")}
                  className="absolute top-2 right-2 w-7 h-7 bg-dark/70 text-white rounded-full text-xs flex items-center justify-center hover:bg-dark transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center text-muted-foreground cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <>
                    <Loader2 size={24} className="mx-auto mb-2 animate-spin text-primary" />
                    <p className="text-xs font-medium">Converting to WebP…</p>
                  </>
                ) : (
                  <>
                    <ImageIcon size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-medium">Click to upload image</p>
                    <p className="text-xs opacity-60 mt-1">Auto-converts to WebP</p>
                  </>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
            <div className="flex gap-2">
              <input
                value={form.featuredImage}
                onChange={(e) => set("featuredImage", e.target.value)}
                placeholder="Or paste image URL..."
                className="flex-1 rounded-xl border border-border px-4 py-2 text-sm focus:border-primary outline-none"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-dark hover:bg-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Upload size={14} /> Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
