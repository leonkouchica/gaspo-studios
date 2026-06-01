import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, Eye, Pencil, Trash2, RefreshCw, AlertCircle, Loader2
} from "lucide-react";
import { fetchBlogPosts, deleteBlogPost, publishScheduledPosts } from "../../../lib/actions/blog";
import { toast } from "sonner";

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
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${
        STATUS_COLORS[status] ?? "bg-muted text-muted-foreground border-border"
      }`}
    >
      {status}
    </span>
  );
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: { name: string; avatar: string; role: string };
  featuredImage: string;
  status: string;
  publishedAt: string;
  views: number;
}

function AdminBlogPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchBlogPosts({ data: { status: statusFilter, search, page, limit: 10 } });
      // Handle new paginated response format
      if (result && typeof result === "object" && "items" in result) {
        const r = result as any;
        setPosts(r.items as BlogPost[]);
        setTotalPages(r.totalPages || 1);
        setTotal(r.total || 0);
      } else {
        setPosts((result as BlogPost[]) || []);
        setTotalPages(1);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => {
    setPage(1); // Reset to page 1 when filters change
  }, [search, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => loadPosts(), search ? 400 : 0);
    return () => clearTimeout(timeout);
  }, [loadPosts, search]);

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setDeletingId(post.id);
    try {
      await deleteBlogPost({ data: { id: post.id } });
      toast.success("Post deleted.");
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
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
          <h1 className="text-2xl font-bold text-dark">Blog Posts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? "Loading…" : `${total} total posts`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadPosts()}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white border border-border text-dark rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <Link
            to="/admin/blog/new"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105"
          >
            <Plus size={16} /> New Post
          </Link>
          <button
            type="button"
            onClick={async () => {
              try {
                const result = await publishScheduledPosts();
                const r = result as any;
                if (r.published > 0) {
                  toast.success(`Published ${r.published} scheduled post(s): ${r.posts.join(", ")}`);
                  loadPosts();
                } else {
                  toast.info(r.message || "No scheduled posts ready.");
                }
              } catch (err: any) { toast.error(err.message); }
            }}
            className="inline-flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-700 hover:bg-violet-500/20 rounded-xl px-3 py-2 text-xs font-semibold transition-colors"
            title="Publish all scheduled posts whose time has arrived"
          >
            ⏰ Publish Scheduled
          </button>
        </div>
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

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Post
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Author
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground">
                    <Loader2 size={24} className="animate-spin mx-auto mb-3 text-primary" />
                    <p className="text-sm">Loading blog posts from Supabase…</p>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground">
                    {search || statusFilter !== "all"
                      ? "No posts match your filters."
                      : "No posts yet. Click 'New Post' to create your first article."}
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {post.featuredImage ? (
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-12 h-12 rounded-lg object-cover shrink-0 bg-muted"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted shrink-0 flex items-center justify-center text-muted-foreground text-xs font-bold">
                            No img
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-dark line-clamp-1">{post.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{post.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {post.author?.name?.[0] ?? "?"}
                        </div>
                        <span className="text-dark">{post.author?.name ?? "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        {post.status === "published" && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-dark flex items-center justify-center transition-colors"
                            title="View post"
                          >
                            <Eye size={14} />
                          </a>
                        )}
                        <Link
                          to="/admin/blog/$postId/edit"
                          params={{ postId: post.id }}
                          className="w-8 h-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-dark flex items-center justify-center transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(post)}
                          disabled={deletingId === post.id}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
                          title="Delete"
                        >
                          {deletingId === post.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-2 rounded-xl border border-border text-sm hover:bg-muted disabled:opacity-30 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground px-3">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-2 rounded-xl border border-border text-sm hover:bg-muted disabled:opacity-30 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
