import { Link } from "@tanstack/react-router";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  crumb?: string;
  image?: string;
}

export function PageHeader({ title, subtitle, crumb, image }: PageHeaderProps) {
  return (
    <section className="relative text-white pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-dark">
      {/* Background image */}
      {image && (
        <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" />
      )}
      {/* Overlay — stronger when an image is present */}
      <div
        className={`absolute inset-0 ${
          image
            ? "bg-gradient-to-b from-dark/80 via-dark/60 to-dark/80"
            : "bg-gradient-to-br from-primary/20 via-transparent to-transparent"
        }`}
      />

      <div className="container-x relative text-center">
        {crumb && (
          <p className="text-white/50 text-sm mb-4">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
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
