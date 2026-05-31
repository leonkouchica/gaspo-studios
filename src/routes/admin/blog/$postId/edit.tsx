import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft, Save } from "lucide-react";
import { blogPosts } from "../../../../data/blog";

export const Route = createFileRoute("/admin/blog/$postId/edit")({
  loader: ({ params }) => {
    const post = blogPosts.find((p) => p.id === params.postId);
    if (!post) throw notFound();
    return post;
  },
  component: EditBlogPostPage,
});

function EditBlogPostPage() {
  const post = Route.useLoaderData();

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
          <p className="text-muted-foreground text-sm mt-0.5 truncate max-w-xs">{post.title}</p>
        </div>
        <button className="ml-auto inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105">
          <Save size={15} /> Save Changes
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-8 text-center text-muted-foreground">
        <p className="font-semibold text-dark">Editing: {post.title}</p>
        <p className="text-sm mt-2">This form mirrors the Create Post flow, pre-populated with data.</p>
      </div>
    </div>
  );
}
