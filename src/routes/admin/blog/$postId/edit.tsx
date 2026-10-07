import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  Save,
  Image as ImageIcon,
  Loader2,
  Upload,
  Bell,
  Mail,
  User,
  Plus,
  Trash2,
  AlignLeft,
  Images,
} from "lucide-react";
import {
  fetchBlogPostById,
  updateBlogPost,
  uploadBlogImage,
  triggerBlogPushNotification,
  broadcastBlogNewsletter,
} from "../../../../lib/actions/blog";
import { arrayBufferToBase64 } from "../../../../lib/base64";
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

const AUTHOR_PRESETS = [
  {
    name: "Marco Gaspo",
    role: "Founder & Senior Photographer",
    avatar: "/images/team_founder.webp",
  },
  {
    name: "Aisha Bello",
    role: "Lead Retoucher & Editor",
    avatar: "/images/portrait_woman.webp",
  },
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
        <Link
          to="/admin/blog"
          className="mt-4 inline-flex items-center gap-2 text-primary hover:underline font-medium"
        >
          <ChevronLeft size={16} /> Back to Blog Posts
        </Link>
      </div>
    </div>
  ),
});

function EditBlogPostPage() {
  const post = Route.useLoaderData();
  const navigate = useNavigate();

  const featuredInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    category: "",
    status: "draft" as "draft" | "published" | "scheduled",
    featuredImage: "",
    sideImage: "",
    sideImageCaption: "",
    galleryImages: [] as string[],
    tags: "",
    authorName: "Marco Gaspo",
    authorRole: "Founder & Senior Photographer",
    authorAvatar: "/images/team_founder.webp",
  });

  const [saving, setSaving] = useState(false);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [uploadingSide, setUploadingSide] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [sendingPush, setSendingPush] = useState(false);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);

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
        sideImage: (post as any).sideImage || "",
        sideImageCaption: (post as any).sideImageCaption || "",
        galleryImages: Array.isArray((post as any).galleryImages)
          ? (post as any).galleryImages
          : [],
        tags: Array.isArray((post as any).tags) ? (post as any).tags.join(", ") : "",
        authorName: (post as any).author?.name || "Marco Gaspo",
        authorRole: (post as any).author?.role || "Founder & Senior Photographer",
        authorAvatar: (post as any).author?.avatar || "/images/team_founder.webp",
      });
      setLoaded(true);
    }
  }, [post, loaded]);

  const set = (f: string, v: any) => setForm((s) => ({ ...s, [f]: v }));

  const handleFeaturedImageUpload = async (file: File) => {
    setUploadingFeatured(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const result = await uploadBlogImage({
        data: { fileBase64: base64, fileName: file.name, mimeType: file.type },
      });
      set("featuredImage", (result as any).url);
      toast.success("Featured image uploaded and converted to WebP.");
    } catch (err: any) {
      toast.error(`Image upload failed: ${err.message}`);
    } finally {
      setUploadingFeatured(false);
    }
  };

  const handleSideImageUpload = async (file: File) => {
    setUploadingSide(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const result = await uploadBlogImage({
        data: { fileBase64: base64, fileName: file.name, mimeType: file.type },
      });
      set("sideImage", (result as any).url);
      toast.success("Side image uploaded and converted to WebP.");
    } catch (err: any) {
      toast.error(`Side image upload failed: ${err.message}`);
    } finally {
      setUploadingSide(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const result = await uploadBlogImage({
        data: { fileBase64: base64, fileName: file.name, mimeType: file.type },
      });
      set("authorAvatar", (result as any).url);
      toast.success("Author avatar uploaded.");
    } catch (err: any) {
      toast.error(`Avatar upload failed: ${err.message}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleGalleryUpload = async (files: FileList | File[]) => {
    setUploadingGallery(true);
    let successCount = 0;
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const base64 = arrayBufferToBase64(arrayBuffer);
          const result = await uploadBlogImage({
            data: { fileBase64: base64, fileName: file.name, mimeType: file.type },
          });
          newUrls.push((result as any).url);
          successCount++;
        } catch (err: any) {
          toast.error(`Failed to upload ${file.name}: ${err.message}`);
        }
      }
      if (newUrls.length > 0) {
        setForm((s) => ({ ...s, galleryImages: [...s.galleryImages, ...newUrls] }));
        toast.success(`Added ${successCount} image${successCount > 1 ? "s" : ""} to bottom gallery.`);
      }
    } finally {
      setUploadingGallery(false);
    }
  };

  const addGalleryImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setForm((s) => ({ ...s, galleryImages: [...s.galleryImages, customImageUrl.trim()] }));
    setCustomImageUrl("");
  };

  const removeGalleryImage = (idx: number) => {
    setForm((s) => ({
      ...s,
      galleryImages: s.galleryImages.filter((_, i) => i !== idx),
    }));
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
            ? form.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
          author: {
            name: form.authorName.trim() || "Marco Gaspo",
            role: form.authorRole.trim() || "Founder & Senior Photographer",
            avatar: form.authorAvatar.trim() || "/images/team_founder.webp",
          },
          featuredImage: form.featuredImage || "/images/blog_placeholder.webp",
          sideImage: form.sideImage.trim() || undefined,
          sideImageCaption: form.sideImageCaption.trim() || undefined,
          galleryImages: form.galleryImages,
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

  const handleSendPush = async () => {
    if (!confirm("Send a push notification for this post right now?")) return;
    setSendingPush(true);
    try {
      const res = await triggerBlogPushNotification({ data: { id: (post as any).id } });
      toast.success(`Push sent! (${res.sent} delivered, ${res.failed} failed)`);
    } catch (err: any) {
      toast.error(`Push failed: ${err.message}`);
    } finally {
      setSendingPush(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!confirm("Broadcast this post to all newsletter subscribers right now?")) return;
    setSendingNewsletter(true);
    try {
      const res = await broadcastBlogNewsletter({ data: { id: (post as any).id } });
      toast.success(`Newsletter sent! (${res.successCount} delivered, ${res.failCount} failed)`);
    } catch (err: any) {
      toast.error(`Newsletter failed: ${err.message}`);
    } finally {
      setSendingNewsletter(false);
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
    <div className="space-y-6 max-w-5xl">
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

      <div className="grid md:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Main Content Area */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
            <div>
              <label className="text-sm font-semibold text-dark block mb-1.5">Title *</label>
              <input
                value={form.title}
                onChange={(e) => {
                  set("title", e.target.value);
                  set(
                    "slug",
                    e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, ""),
                  );
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
                placeholder="A short summary shown in preview cards and under the article title…"
                className={textareaCls}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-dark block mb-1.5">Content Body *</label>
              <RichTextEditor content={form.body} onChange={(html) => set("body", html)} uploadFolder="blog" />
            </div>
          </div>

          {/* Left-Aligned / Side Content Image */}
          <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlignLeft size={18} className="text-primary" />
                <h3 className="font-semibold text-dark text-base">Left-Aligned Content Image</h3>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                Floats beside text
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              This image will be aligned on the left side of the blog post body paragraph, with text wrapping around it cleanly.
            </p>

            <input
              ref={sideInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleSideImageUpload(f);
              }}
            />

            <div className="grid sm:grid-cols-[160px_1fr] gap-4 items-start">
              {form.sideImage ? (
                <div className="relative group rounded-xl overflow-hidden border border-border aspect-[4/3] bg-muted">
                  <img
                    src={form.sideImage}
                    alt="Side preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => set("sideImage", "")}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-dark/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors text-xs"
                    title="Remove side image"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => sideInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-primary rounded-xl aspect-[4/3] flex flex-col items-center justify-center text-center p-3 cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  {uploadingSide ? (
                    <Loader2 size={20} className="animate-spin text-primary" />
                  ) : (
                    <>
                      <Upload size={18} className="text-muted-foreground mb-1" />
                      <span className="text-xs font-medium text-dark">Upload Image</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">Auto WebP</span>
                    </>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    value={form.sideImage}
                    onChange={(e) => set("sideImage", e.target.value)}
                    placeholder="Or paste side image URL…"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => sideInputRef.current?.click()}
                    disabled={uploadingSide}
                    className="shrink-0 bg-muted border border-border px-3 py-2 text-xs font-semibold rounded-xl hover:bg-white text-dark flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload size={13} /> Browse
                  </button>
                </div>

                <div>
                  <input
                    value={form.sideImageCaption}
                    onChange={(e) => set("sideImageCaption", e.target.value)}
                    placeholder="Optional image caption (e.g. Masterclass speaker keynote)"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Multiple Images at the Bottom (Gallery) */}
          <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Images size={18} className="text-primary" />
                <h3 className="font-semibold text-dark text-base">Bottom Photo Gallery</h3>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {form.galleryImages.length} image{form.galleryImages.length !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Add multiple high-resolution photos displayed in a clean gallery grid at the bottom of the article.
            </p>

            <input
              ref={galleryInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleGalleryUpload(e.target.files);
                }
              }}
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
                className="bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                {uploadingGallery ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                Upload Multiple Images
              </button>

              <div className="flex-1 flex gap-2 min-w-[240px]">
                <input
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGalleryImageUrl();
                    }
                  }}
                  placeholder="Or paste an image URL and click Add…"
                  className="flex-1 rounded-xl border border-border px-3 py-1.5 text-xs focus:border-primary outline-none"
                />
                <button
                  type="button"
                  onClick={addGalleryImageUrl}
                  className="bg-muted border border-border text-dark text-xs px-3 py-1.5 rounded-xl font-medium hover:bg-white transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {form.galleryImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {form.galleryImages.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-border aspect-[4/3] bg-muted"
                  >
                    <img
                      src={url}
                      alt={`Gallery item ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                        title="Delete image"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => galleryInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-6 text-center text-muted-foreground cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors"
              >
                <ImageIcon size={24} className="mx-auto mb-1.5 opacity-40" />
                <p className="text-xs font-medium">No bottom images added yet</p>
                <p className="text-[11px] opacity-60">Click here to upload multiple images at once</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-dark block mb-1">
                Tags (comma-separated)
              </label>
              <input
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="wedding, tips, portrait"
                className={inputCls}
              />
            </div>
          </div>

          {/* Author Settings */}
          <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-dark text-sm flex items-center gap-1.5">
                <User size={15} className="text-primary" /> Author Details
              </h3>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Quick Presets</label>
              <div className="flex flex-wrap gap-1.5">
                {AUTHOR_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setForm((s) => ({
                        ...s,
                        authorName: p.name,
                        authorRole: p.role,
                        authorAvatar: p.avatar,
                      }));
                      toast.success(`Author set to ${p.name}`);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      form.authorName === p.name
                        ? "bg-primary text-white border-primary font-semibold"
                        : "bg-muted border-border text-dark hover:bg-white"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-dark block mb-1">Author Name *</label>
              <input
                value={form.authorName}
                onChange={(e) => set("authorName", e.target.value)}
                className={inputCls}
                placeholder="e.g. Marco Gaspo"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-dark block mb-1">Author Role / Title</label>
              <input
                value={form.authorRole}
                onChange={(e) => set("authorRole", e.target.value)}
                className={inputCls}
                placeholder="e.g. Founder & Senior Photographer"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-dark block mb-1.5">Author Avatar</label>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleAvatarUpload(f);
                }}
              />
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={form.authorAvatar || "/images/team_founder.webp"}
                  alt={form.authorName}
                  className="w-12 h-12 rounded-full object-cover border border-border shrink-0 bg-muted"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="bg-muted hover:bg-white text-dark text-xs border border-border px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {uploadingAvatar ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Upload size={12} />
                  )}
                  Change Avatar
                </button>
              </div>
              <input
                value={form.authorAvatar}
                onChange={(e) => set("authorAvatar", e.target.value)}
                placeholder="Avatar image URL…"
                className={inputCls}
              />
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
            <h3 className="font-bold text-dark text-sm">Featured Image (Banner)</h3>
            <div className="space-y-3">
              <input
                type="file"
                ref={featuredInputRef}
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFeaturedImageUpload(f);
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => featuredInputRef.current?.click()}
                disabled={uploadingFeatured}
                className="w-full bg-muted hover:bg-muted/80 text-dark rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 border border-border transition-colors disabled:opacity-50 cursor-pointer"
              >
                {uploadingFeatured ? (
                  <Loader2 size={14} className="animate-spin text-primary" />
                ) : (
                  <Upload size={14} />
                )}
                Upload Featured Image
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
                <div className="relative">
                  <img
                    src={form.featuredImage}
                    alt="Preview"
                    className="w-full h-36 object-cover rounded-xl border border-border bg-muted"
                  />
                  <button
                    type="button"
                    onClick={() => set("featuredImage", "")}
                    className="absolute top-2 right-2 w-6 h-6 bg-dark/70 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Distribute Actions */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-border mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <Mail size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark">Distribute Post</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Notify your audience about this post
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-border rounded-2xl p-5">
            <button
              type="button"
              onClick={handleSendPush}
              disabled={sendingPush || form.status !== "published"}
              className="w-full bg-[#3d5930] hover:bg-[#2d4323] text-white rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {sendingPush ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
              Send Push Notification
            </button>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed text-center">
              Sends a browser push notification to all Blog Posts subscribers.
              {form.status !== "published" && " (Post must be published first)"}
            </p>
          </div>

          <div className="border border-border rounded-2xl p-5">
            <button
              type="button"
              onClick={handleSendNewsletter}
              disabled={sendingNewsletter || form.status !== "published"}
              className="w-full bg-[#548043] hover:bg-[#436735] text-white rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {sendingNewsletter ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Mail size={16} />
              )}
              Send Email Newsletter
            </button>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed text-center">
              Sends a branded email to all newsletter subscribers.
              {form.status !== "published" && " (Post must be published first)"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
