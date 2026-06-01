import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { fetchBlogPost, recordBlogPostView } from "../../lib/actions/blog";
import { ScrollReveal } from "../../components/ScrollReveal";

export const Route = createFileRoute("/blog/$postId")({
  loader: async ({ params }) => {
    try {
      const post = await fetchBlogPost({ data: { slug: params.postId } });
      if (!post) throw notFound();
      return post;
    } catch (err) {
      throw notFound();
    }
  },
  head: ({ loaderData: post }) => {
    if (!post) return { meta: [{ title: "Post Not Found" }] };
    
    const pathname = `/blog/${post.slug}`;
    
    return {
      meta: [
        { title: `${post.seo?.title || post.title} — Gaspo Studios` },
        { name: "description", content: post.seo?.description || post.excerpt },
        
        /* OpenGraph / Facebook */
        { property: "og:type", content: "article" },
        { property: "og:url", content: `https://gaspotechstudios.com${pathname}` },
        { property: "og:title", content: post.seo?.title || post.title },
        { property: "og:description", content: post.seo?.description || post.excerpt },
        { property: "og:image", content: post.seo?.ogImage || post.featuredImage },
        { property: "article:published_time", content: post.publishedAt || "" },
        
        /* Twitter */
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:url", content: `https://gaspotechstudios.com${pathname}` },
        { name: "twitter:title", content: post.seo?.title || post.title },
        { name: "twitter:description", content: post.seo?.description || post.excerpt },
        { name: "twitter:image", content: post.seo?.ogImage || post.featuredImage },
      ],
      links: [{ rel: "canonical", href: `https://gaspotechstudios.com${pathname}` }],
    };
  },
  component: BlogPostDetail,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-dark text-white text-center px-4">
      <div>
        <h1 className="text-5xl font-bold">Post Not Found</h1>
        <p className="text-white/60 mt-4">This post doesn't exist or has been removed.</p>
        <Link to="/blog" className="mt-8 inline-flex items-center gap-2 bg-primary text-white rounded-full px-6 py-3 font-medium">
          <ArrowLeft size={16} /> Back to Blog
        </Link>
      </div>
    </div>
  ),
});

function BlogPostDetail() {
  const post = Route.useLoaderData();
  if (!post) return null;

  // Record view on client-side — keeps fetchBlogPost (GET) idempotent
  useEffect(() => {
    if (post?.slug) {
      recordBlogPostView({ data: { slug: post.slug } }).catch(() => {
        // Silently ignore view-tracking failures — non-critical
      });
    }
  }, [post?.slug]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url: window.location.href });
        return;
      } catch (err) {
        // User may have cancelled, or it failed. We'll fallback to clipboard just in case.
        console.error("Error sharing", err);
      }
    }
    
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <>
      <article className="bg-background min-h-screen pb-20">
        {/* Header / Hero */}
        <header className="relative min-h-[60vh] flex items-end justify-center overflow-hidden bg-dark">
          <img src={post.featuredImage} alt={post.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
          
          <div className="container-x relative z-10 pt-32 pb-16 w-full max-w-4xl text-center">
            <ScrollReveal>
              <span className="bg-primary/20 text-primary border border-primary/30 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider mb-6 inline-block">
                {post.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm">
                <div className="flex items-center gap-2">
                  <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full border border-white/20" />
                  <span>{post.author.name}</span>
                </div>
                {post.publishedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-primary" />
                    {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-primary" />
                  5 min read
                </div>
              </div>
            </ScrollReveal>
          </div>
        </header>

        {/* Content */}
        <div className="container-x mt-12 max-w-3xl">
          <ScrollReveal delay={100}>
            <p className="text-xl md:text-2xl font-light text-dark/80 leading-relaxed mb-12 italic border-l-4 border-primary pl-6 py-2">
              {post.excerpt}
            </p>
            
            <div 
              className="[&>p]:mb-6 [&>p]:text-lg [&>p]:leading-relaxed [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-12 [&>h2]:mb-4 text-dark"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
            
            <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-dark">Share:</span>
                <button onClick={handleShare} className="w-10 h-10 rounded-full bg-muted text-dark flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="mt-12 bg-white border border-border p-8 rounded-3xl flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
              <img src={post.author.avatar} alt={post.author.name} className="w-24 h-24 rounded-full object-cover" />
              <div>
                <h3 className="text-lg font-bold text-dark">{post.author.name}</h3>
                <p className="text-primary text-sm font-medium mb-3">{post.author.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Passionate about capturing authentic stories and timeless moments.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </article>
    </>
  );
}
