import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus, Eye, Pencil, Trash2, CalendarDays, User } from "lucide-react";
import { blogPosts } from "../../../data/blog";

export const Route = createFileRoute("/admin/blog/")({
  component: AdminBlogPage,
});

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  published: "bg-green-500/10 text-green-600 border-green-500/20",
  scheduled: "bg-violet-500/10 text-violet-600 border-violet-500/20",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[status] ?? "bg-muted text-muted-foreground border-border"}`}>
      {status}
    </span>
  );
}

function AdminBlogPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = blogPosts.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Blog Posts</h1>
          <p className="text-muted-foreground text-sm mt-1">{blogPosts.length} total posts</p>
        </div>
        <Link
          to="/admin/blog/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105"
        >
          <Plus size={16} /> New Post
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-border px-3 py-2.5 text-sm bg-white focus:border-primary outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Drafts</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Post</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Author</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((post) => (
                <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={post.featuredImage} alt={post.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      <div>
                        <p className="font-semibold text-dark line-clamp-1">{post.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{post.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {post.author.name[0]}
                      </div>
                      <span className="text-dark">{post.author.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <button className="w-8 h-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-dark flex items-center justify-center transition-colors" title="Preview">
                        <Eye size={14} />
                      </button>
                      <Link
                        to="/admin/blog/$postId/edit"
                        params={{ postId: post.id }}
                        className="w-8 h-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-dark flex items-center justify-center transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button className="w-8 h-8 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 flex items-center justify-center transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground">
                    No posts match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
