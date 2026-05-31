import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Save, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/admin/blog/new")({
  component: NewBlogPostPage,
});

function NewBlogPostPage() {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    status: "draft",
    featuredImage: "",
  });

  const set = (f: string, v: string) => setForm((s) => ({ ...s, [f]: v }));

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
        <button className="ml-auto inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105">
          <Save size={15} /> Save Post
        </button>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
            <div>
              <label className="text-sm font-semibold text-dark block mb-1.5">Title</label>
              <input
                value={form.title}
                onChange={(e) => {
                  set("title", e.target.value);
                  set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                }}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary outline-none"
                placeholder="Post title..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-dark block mb-1.5">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                rows={16}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary outline-none resize-none"
                placeholder="Write your post content here (Markdown supported)..."
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-dark block mb-1.5">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary outline-none resize-none"
                placeholder="A brief summary for the blog index..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
            <h3 className="font-semibold text-dark">Settings</h3>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full rounded-xl border border-border px-4 py-2 text-sm focus:border-primary outline-none">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full rounded-xl border border-border px-4 py-2 text-sm focus:border-primary outline-none">
                <option value="">Select a category</option>
                {["Photography Tips", "Weddings", "Studio News", "Gear Review", "Business"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">URL Slug</label>
              <input value={form.slug} onChange={(e) => set("slug", e.target.value)} className="w-full rounded-xl border border-border px-4 py-2 text-sm focus:border-primary outline-none" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-dark">Featured Image</h3>
            {form.featuredImage ? (
              <img src={form.featuredImage} alt="Featured" className="w-full h-40 object-cover rounded-xl" />
            ) : (
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
                <ImageIcon size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium">Upload Image</p>
              </div>
            )}
            <input value={form.featuredImage} onChange={(e) => set("featuredImage", e.target.value)} placeholder="Image URL..." className="w-full rounded-xl border border-border px-4 py-2 text-sm focus:border-primary outline-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
