import { Link } from "@tanstack/react-router";

export function PageHeader({ title, subtitle, crumb }: { title: string; subtitle?: string; crumb?: string }) {
  return (
    <section className="bg-dark text-white pt-32 pb-20 md:pt-40 md:pb-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
      <div className="container-x relative text-center">
        {crumb && (
          <p className="text-white/50 text-sm mb-4">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span>{crumb}</span>
          </p>
        )}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">{subtitle}</p>}
      </div>
    </section>
  );
}