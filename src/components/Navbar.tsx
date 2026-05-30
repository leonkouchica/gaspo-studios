import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown, CalendarDays, Clock } from "lucide-react";
import { Logo } from "./Logo";

const linksStart = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/gallery", label: "Gallery" },
  { to: "/book", label: "Book a Shoot" },
] as const;

const linksEnd = [
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

const eventDropdown = [
  { to: "/events#upcoming", label: "Upcoming Events", icon: CalendarDays, desc: "Workshops, exhibitions & meetups" },
  { to: "/events#past", label: "Past Events", icon: Clock, desc: "Browse our previous sessions" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [mobileEventsOpen, setMobileEventsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setEventsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-1 bg-dark-secondary/60 backdrop-blur rounded-full px-2 py-1.5 border border-white/10">
          {linksStart.map((l) => (
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

          {/* Events dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setEventsOpen((v) => !v)}
              onMouseEnter={() => setEventsOpen(true)}
              className="flex items-center gap-1 text-white/80 hover:text-white text-sm px-3 py-1.5 rounded-full transition-colors"
            >
              Events
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${eventsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {eventsOpen && (
              <div
                onMouseLeave={() => setEventsOpen(false)}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-dark-secondary/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
              >
                {eventDropdown.map(({ to, label, icon: Icon, desc }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setEventsOpen(false)}
                    className="flex items-start gap-3 px-4 py-3.5 hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <p className="text-xs text-white/50 mt-0.5">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {linksEnd.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-white/80 hover:text-white text-sm px-3 py-1.5 rounded-full transition-colors"
              activeProps={{ className: "bg-white/10 text-white text-sm px-3 py-1.5 rounded-full" }}
              activeOptions={{ exact: false }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/book"
            className="hidden lg:inline-flex items-center bg-primary text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-primary-hover transition-colors"
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

      {/* ── Mobile full-screen overlay ── */}
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
            {linksStart.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-3xl font-bold hover:text-primary transition-colors"
              >
                {l.label}
              </Link>
            ))}

            {/* Mobile Events accordion */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setMobileEventsOpen((v) => !v)}
                className="flex items-center gap-2 text-3xl font-bold hover:text-primary transition-colors"
              >
                Events
                <ChevronDown
                  size={24}
                  className={`transition-transform duration-200 ${mobileEventsOpen ? "rotate-180" : ""}`}
                />
              </button>
              {mobileEventsOpen && (
                <div className="mt-3 flex flex-col items-center gap-3">
                  {eventDropdown.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => { setOpen(false); setMobileEventsOpen(false); }}
                      className="text-lg text-white/70 hover:text-primary transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {linksEnd.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-3xl font-bold hover:text-primary transition-colors"
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