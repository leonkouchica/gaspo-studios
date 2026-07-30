import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { ArrowRight, MessageCircle, Loader2, BookOpen } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { fetchBlogPosts } from "../../lib/actions/blog";
import { toast } from "sonner";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Gaspo Studios" },
      { name: "description", content: "Photography insights, tips, and studio stories from the Gaspo team." },
      { property: "og:title", content: "Blog — Gaspo Studios" },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  featuredImage: string;
  status: string;
  publishedAt: string | null;
  views: number;
  comments: number;
  tags: string[];
}

function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBlogPosts({ data: { status: "published" } });
      setPosts(data.items as BlogPost[]);
    } catch (err: any) {
      console.error("Failed to load blog posts:", err);
      toast.error(err.message || "Failed to load blog posts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const featured = posts.find((p) => p.status === "published") || posts[0];
  const rest = posts.filter((p) => p.id !== featured?.id);

  return (
    <>
      <PageHeader 
        title="Photography Insights" 
        crumb="Blog" 
        subtitle="Tips, studio updates, and featured shoots from the Gaspo team." 
        image="/images/photographer_hero.webp"
      />

      {loading ? (
        <div className="py-32 text-center text-muted-foreground">
          <Loader2 size={32} className="animate-spin mx-auto mb-3 text-primary" />
          <p className="text-sm">Loading articles…</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-32 text-center text-muted-foreground max-w-md mx-auto px-4">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30 text-primary" />
          <p className="font-semibold text-dark text-base">No Published Articles Yet</p>
          <p className="text-sm mt-1">Check back soon — our team is working on new photography insights.</p>
        </div>
      ) : (
        <>
          {/* Featured Post */}
          {featured && (
            <section className="py-20 md:py-28">
              <div className="container-x">
                <div className="bg-white rounded-2xl border border-border overflow-hidden grid md:grid-cols-2">
                  <img
                    src={featured.featuredImage}
                    alt={featured.title}
                    className="w-full h-72 md:h-full object-cover bg-muted"
                  />
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium self-start">
                      {featured.category}
                    </span>
                    <h2 className="text-2xl md:text-4xl font-bold text-dark mt-4">{featured.title}</h2>
                    <p className="text-muted-foreground mt-4 leading-relaxed line-clamp-4">{featured.excerpt}</p>
                    <div className="flex items-center justify-between mt-6">
                      <span className="text-sm text-muted-foreground">
                        {featured.publishedAt
                          ? new Date(featured.publishedAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : ""}
                      </span>
                      <Link
                        to="/blog/$postId"
                        params={{ postId: featured.slug }}
                        className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                      >
                        Read More <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Post Grid */}
          {rest.length > 0 && (
            <section className="pb-20 md:pb-28">
              <div className="container-x">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {rest.map((p) => (
                    <article
                      key={p.id}
                      className="bg-white rounded-2xl p-5 border border-border hover:-translate-y-1 hover:shadow-lg transition-all"
                    >
                      <img
                        src={p.featuredImage}
                        alt={p.title}
                        className="rounded-xl h-48 w-full object-cover bg-muted"
                      />
                      <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                        <span>
                          {p.publishedAt
                            ? new Date(p.publishedAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : ""}
                        </span>
                        <span>·</span>
                        <span className="text-primary font-medium">{p.category}</span>
                      </div>
                      <h3 className="text-lg font-bold text-dark mt-2 line-clamp-2">{p.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{p.excerpt}</p>
                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <Link
                          to="/blog/$postId"
                          params={{ postId: p.slug }}
                          className="text-primary text-sm font-medium inline-flex items-center gap-1"
                        >
                          Read Article <ArrowRight size={14} />
                        </Link>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <span className="flex items-center gap-1 text-xs">
                            <MessageCircle size={14} /> {p.comments || 0}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}