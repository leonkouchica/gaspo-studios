import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/gallery", label: "Gallery" },
  { to: "/book", label: "Book a Shoot" },
  { to: "/shop", label: "Shop" },
  { to: "/events", label: "Events" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-dark-secondary/90 backdrop-blur-md border-b border-white/5" : "bg-transparent"
      }`}
    >
      <div className="container-x flex items-center justify-between h-16 md:h-20">
        <div className={scrolled ? "[&_*]:text-white [&_span.text-primary]:text-primary" : "[&_*]:text-white [&_span.text-primary]:text-primary"}>
          <Logo light />
        </div>

        <nav className="hidden lg:flex items-center gap-1 bg-dark-secondary/60 backdrop-blur rounded-full px-2 py-1.5 border border-white/10">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-white/80 hover:text-white text-sm px-3 py-1.5 rounded-full transition-colors"
              activeProps={{ className: "bg-white/10 text-white text-sm px-3 py-1.5 rounded-full" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/book"
            className="hidden md:inline-flex items-center bg-primary text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Book a Shoot
          </Link>
          <button
            className="lg:hidden w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-dark text-white flex flex-col">
          <div className="container-x flex items-center justify-between h-16 md:h-20">
            <Logo light />
            <button
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 flex flex-col items-center justify-center gap-6">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-3xl font-bold hover:text-primary"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/book"
              onClick={() => setOpen(false)}
              className="mt-4 bg-primary text-white rounded-full px-8 py-3.5 font-medium"
            >
              Book a Shoot
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}