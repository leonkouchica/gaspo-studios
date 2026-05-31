import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, Search, Trash2, Eye, EyeOff, LayoutGrid, CheckCircle2 } from "lucide-react";
import { galleryImages } from "../../../data/gallery";

export const Route = createFileRoute("/admin/gallery/")({
  component: AdminGalleryPage,
});

function AdminGalleryPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [images, setImages] = useState(galleryImages);

  const categories = Array.from(new Set(images.map((i) => i.category)));

  const filtered = images.filter((i) => {
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || i.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const toggleVisibility = (id: string) => {
    setImages(images.map((i) => i.id === id ? { ...i, visible: !i.visible } : i));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Gallery Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{images.length} total images in portfolio</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105">
          <Upload size={16} /> Upload Images
        </button>
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
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="bg-white rounded-xl border border-border p-1 flex gap-1">
          <button className="p-2 rounded-lg bg-muted text-dark"><LayoutGrid size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map((img) => (
          <div key={img.id} className={`group relative rounded-2xl overflow-hidden border transition-all ${img.visible ? "border-border hover:border-primary/50" : "border-border opacity-50 hover:opacity-100"}`}>
            <div className="aspect-[4/3] bg-muted">
              <img src={img.src} alt={img.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
              <div className="flex justify-end gap-1">
                <button
                  onClick={() => toggleVisibility(img.id)}
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
                  title={img.visible ? "Hide from public gallery" : "Show in public gallery"}
                >
                  {img.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button className="w-8 h-8 rounded-lg bg-white/20 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors">
                  <Trash2 size={14} />
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
            {img.featured && (
              <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                Featured
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 mt-8">
        <CheckCircle2 size={18} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Supabase Storage Integration (Phase 3):</strong> Currently showing local seed data. Uploading images requires the Supabase Storage bucket to be provisioned.
        </p>
      </div>
    </div>
  );
}
