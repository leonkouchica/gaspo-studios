import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Save, Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { fetchBlogPostById, updateBlogPost, uploadBlogImage } from "../../../../lib/actions/blog";
import RichTextEditor from "../../../../components/RichTextEditor";
import { toast } from "sonner";

const CATEGORIES = [
  "Photography Tips",
  "Weddings",
  "Studio News",
  "Gear Review",
  "Business",
  "Events",
  "Behind the Scenes",
];

export const Route = createFileRoute("/admin/blog/$postId/edit")({
  loader: async ({ params }) => {
    try {
      const post = await fetchBlogPostById({ data: { id: params.postId } });
      if (!post) throw new Error("Not found");
      return post;
    } catch {
      throw new Error("Post not found");
    }
  },
  component: EditBlogPostPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-4xl font-bold text-dark">Post Not Found</h1>
        <p className="text-muted-foreground mt-2">This post doesn't exist or has been removed.</p>
        <Link to="/admin/blog" className="mt-4 inline-flex items-center gap-2 text-primary hover:underline font-medium">
          <ChevronLeft size={16} /> Back to Blog Posts
        </Link>
      </div>
    </div>
  ),
});

function EditBlogPostPage() {
  const post = Route.useLoaderData();
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
  const [loaded, setLoaded] = useState(false);

  // Populate form from loaded post
  useEffect(() => {
    if (post && !loaded) {
      setForm({
        title: (post as any).title || "",
        slug: (post as any).slug || "",
        excerpt: (post as any).excerpt || "",
        body: (post as any).body || "",
        category: (post as any).category || "",
        status: (post as any).status || "draft",
        featuredImage: (post as any).featuredImage || "",
        tags: Array.isArray((post as any).tags) ? (post as any).tags.join(", ") : "",
      });
      setLoaded(true);
    }
  }, [post, loaded]);

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
      await updateBlogPost({
        data: {
          id: (post as any).id,
          slug,
          title: form.title.trim(),
          excerpt: form.excerpt.trim(),
          body: form.body.trim(),
          category: form.category,
          tags: form.tags
            ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
          featuredImage: form.featuredImage || "/images/blog_placeholder.webp",
          status: form.status,
        },
      });
      toast.success(`Post "${form.title}" updated.`);
      navigate({ to: "/admin/blog" });
    } catch (err: any) {
      toast.error(`Failed to update: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all";
  const textareaCls =
    "w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none";

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
          <h1 className="text-2xl font-bold text-dark">Edit Post</h1>
          <p className="text-muted-foreground text-sm mt-0.5 truncate max-w-xs">{form.title}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="ml-auto inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Main content */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-dark block mb-1.5">Title *</label>
            <input
              value={form.title}
              onChange={(e) => {
                set("title", e.target.value);
                set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
              }}
              placeholder="Post title"
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-dark block mb-1.5">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="url-friendly-slug"
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-dark block mb-1.5">Excerpt *</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={3}
              placeholder="A short summary shown in previews…"
              className={textareaCls}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-dark block mb-1.5">Content *</label>
            <RichTextEditor content={form.body} onChange={(html) => set("body", html)} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
            <h3 className="font-bold text-dark text-sm">Publish Settings</h3>

            <div>
              <label className="text-xs font-semibold text-dark block mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className={inputCls}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-dark block mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={inputCls}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-dark block mb-1">Tags (comma-separated)</label>
              <input
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="wedding, tips, portrait"
                className={inputCls}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
            <h3 className="font-bold text-dark text-sm">Featured Image</h3>
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(f);
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full bg-muted hover:bg-muted/80 text-dark rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border border-border transition-colors disabled:opacity-50"
              >
                {uploading ? <Loader2 size={14} className="animate-spin text-primary" /> : <Upload size={14} />}
                Upload Image
              </button>

              <div>
                <label className="text-xs font-semibold text-dark block mb-1">Image URL</label>
                <input
                  value={form.featuredImage}
                  onChange={(e) => set("featuredImage", e.target.value)}
                  placeholder="https://… or /images/…"
                  className={inputCls}
                />
              </div>

              {form.featuredImage && (
                <img
                  src={form.featuredImage}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-xl border border-border bg-muted"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
