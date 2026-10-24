import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, Image as ImageIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchBlogPost, recordBlogPostView } from "../../lib/actions/blog";
import { ScrollReveal } from "../../components/ScrollReveal";
import { ShareButton } from "../../components/ShareButton";
import { getOgImageUrl } from "../../lib/og";

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
    const rawImage = post.seo?.ogImage || post.featuredImage;
    const ogImage = getOgImageUrl(rawImage);
    const postTitle = post.seo?.title || post.title;
    const postDesc = post.seo?.description || post.excerpt;

    return {
      meta: [
        { title: `${postTitle} — Gaspo Studios` },
        { name: "description", content: postDesc },

        /* OpenGraph / Facebook / WhatsApp */
        { property: "og:site_name", content: "Gaspo Studios" },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `https://www.gaspostudios.com${pathname}` },
        { property: "og:title", content: postTitle },
        { property: "og:description", content: postDesc },
        { property: "og:image", content: ogImage },
        { property: "og:image:secure_url", content: ogImage },
        { property: "og:image:type", content: "image/jpeg" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: postTitle },
        { property: "article:published_time", content: post.publishedAt || "" },

        /* Twitter */
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:url", content: `https://www.gaspostudios.com${pathname}` },
        { name: "twitter:title", content: postTitle },
        { name: "twitter:description", content: postDesc },
        { name: "twitter:image", content: ogImage },
      ],
      links: [{ rel: "canonical", href: `https://www.gaspostudios.com${pathname}` }],
    };
  },
  component: BlogPostDetail,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-dark text-white text-center px-4">
      <div>
        <h1 className="text-5xl font-bold">Post Not Found</h1>
        <p className="text-white/60 mt-4">This post doesn't exist or has been removed.</p>
        <Link
          to="/blog"
          className="mt-8 inline-flex items-center gap-2 bg-primary text-white rounded-full px-6 py-3 font-medium"
        >
          <ArrowLeft size={16} /> Back to Blog
        </Link>
      </div>
    </div>
  ),
});

function BlogPostDetail() {
  const post = Route.useLoaderData();
  const [activeImage, setActiveImage] = useState<string | null>(null);

  if (!post) return null;

  // Record view on client-side — keeps fetchBlogPost (GET) idempotent
  useEffect(() => {
    if (post?.slug) {
      recordBlogPostView({ data: { slug: post.slug } }).catch(() => {
        // Silently ignore view-tracking failures — non-critical
      });
    }
  }, [post?.slug]);

  return (
    <>
      <article className="bg-background min-h-screen pb-20">
        {/* Header / Hero */}
        <header className="relative min-h-[60vh] flex items-end justify-center overflow-hidden bg-dark">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
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
                  <img
                    src={post.author.avatar || "/images/team_founder.webp"}
                    alt={post.author.name}
                    className="w-8 h-8 rounded-full border border-white/20 object-cover"
                  />
                  <span>{post.author.name}</span>
                </div>
                {post.publishedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-primary" />
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-primary" />5 min read
                </div>
              </div>
            </ScrollReveal>
          </div>
        </header>

        {/* Content */}
        <div className="container-x mt-12 max-w-3xl">
          <p className="text-xl md:text-2xl font-light text-dark/80 leading-relaxed mb-12 italic border-l-4 border-primary pl-6 py-2">
            {post.excerpt}
          </p>

          {/* Post Content with optional Left-Aligned Side Image */}
          <div className="flow-root">
            {post.sideImage && (
              <figure
                className="float-none sm:float-left sm:mr-8 lg:mr-10 mb-6 sm:mb-4 w-full sm:w-[46%] md:w-[44%] sm:max-w-[480px] md:max-w-[500px] lg:max-w-[520px] rounded-2xl overflow-hidden shadow-md border border-border group bg-muted/40 cursor-pointer"
                onClick={() => setActiveImage(post.sideImage || null)}
              >
                <img
                  src={post.sideImage}
                  alt={post.sideImageCaption || post.title}
                  className="w-full h-auto object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                />
                {post.sideImageCaption && (
                  <figcaption className="text-xs text-muted-foreground mt-2 px-3 pb-2 text-center italic">
                    {post.sideImageCaption}
                  </figcaption>
                )}
              </figure>
            )}

            <div
              className="[&>p]:mb-6 [&>p]:text-lg [&>p]:leading-relaxed [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-12 [&>h2]:mb-4 text-dark"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          </div>

          {/* Bottom Photo Gallery */}
          {post.galleryImages && post.galleryImages.length > 0 && (
            <ScrollReveal className="mt-16 pt-10 border-t border-border">
              <div className="flex items-center gap-2 mb-6">
                <ImageIcon size={22} className="text-primary" />
                <h2 className="text-2xl font-bold text-dark">Photo Highlights</h2>
                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full ml-auto font-medium">
                  {post.galleryImages.length} Photo{post.galleryImages.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {post.galleryImages.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-muted cursor-pointer shadow-sm hover:shadow-md transition-all"
                  >
                    <img
                      src={img}
                      alt={`Photo highlight ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-dark/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/90 text-dark text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm shadow">
                        View Photo
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          )}

          <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-dark">Share:</span>
              <ShareButton title={post.title} summary={post.excerpt} />
            </div>
          </div>

          <ScrollReveal className="mt-12 bg-white border border-border p-8 rounded-3xl flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left shadow-sm">
            <img
              src={post.author.avatar || "/images/team_founder.webp"}
              alt={post.author.name}
              className="w-24 h-24 rounded-full object-cover shrink-0 border-2 border-primary/20 shadow-sm"
            />
            <div>
              <h3 className="text-lg font-bold text-dark">{post.author.name}</h3>
              <p className="text-primary text-sm font-medium mb-3">{post.author.role}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Passionate about capturing authentic stories and timeless moments.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </article>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-dark/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <img
              src={activeImage}
              alt="Expanded view"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-dark/80 text-white flex items-center justify-center hover:bg-dark transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
