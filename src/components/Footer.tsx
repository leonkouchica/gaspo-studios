import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-dark text-white">
      <div className="container-x py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="[&_span.text-dark]:text-white">
            <Logo light />
          </div>
          <p className="text-white/60 text-sm mt-4 max-w-xs">
            Where art meets precision in photography. Capturing your most treasured moments since 2014.
          </p>
          <form className="mt-6 flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 rounded-full bg-white/10 border border-white/10 px-4 py-2.5 text-sm placeholder:text-white/40 focus:outline-none focus:border-primary"
            />
            <button className="bg-primary hover:bg-primary-hover transition-colors text-white rounded-full px-5 py-2.5 text-sm font-medium">
              Subscribe
            </button>
          </form>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-white/80">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-white/60 text-sm">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/gallery" className="hover:text-primary">Gallery</Link></li>
            <li><Link to="/blog" className="hover:text-primary">Blog</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-white/80">Services</h4>
          <ul className="mt-4 space-y-2 text-white/60 text-sm">
            <li>Wedding Photography</li>
            <li>Corporate Photography</li>
            <li>Portrait Sessions</li>
            <li>Special Events</li>
            <li>Commercial Shoots</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-white/80">Contact</h4>
          <ul className="mt-4 space-y-3 text-white/60 text-sm">
            <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 text-primary" /> 24 Studio Lane, Suite 5<br />Brooklyn, NY 11201</li>
            <li className="flex items-center gap-2"><Phone size={16} className="text-primary" /> +1 (555) 014-2270</li>
            <li className="flex items-center gap-2"><Mail size={16} className="text-primary" /> hello@gaspostudios.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white/50 text-sm">
          <p>© {new Date().getFullYear()} Gaspo Studios. All rights reserved.</p>
          <div className="flex items-center gap-2">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary transition-colors flex items-center justify-center">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}