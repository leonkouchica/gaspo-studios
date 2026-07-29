import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone, Loader2 } from "lucide-react";
import { Logo } from "./Logo";
import { useState } from "react";
import { subscribeToNewsletter } from "../lib/actions/newsletter";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      await subscribeToNewsletter({ data: { email } });
      toast.success("Subscribed successfully!");
      setEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-dark text-white">
      <div className="container-x py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2">
          <div className="[&_span.text-dark]:text-white">
            <Logo light />
          </div>
          <p className="text-white/60 text-sm mt-4 max-w-xs">
            Where art meets precision in photography. Capturing your most treasured moments since 2014.
          </p>
          <form className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="flex-1 rounded-full bg-white/10 border border-white/10 px-4 py-2.5 text-sm placeholder:text-white/40 focus:outline-none focus:border-primary disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-hover transition-colors text-white rounded-full px-5 py-2.5 text-sm font-medium flex items-center justify-center min-w-[100px] disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Subscribe"}
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
            <li><Link to="/faq" className="hover:text-primary">FAQ</Link></li>
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
            <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 text-primary" /> Phase 2, Charly Boy Bus/Stop, 4a Ajidagan St<br />Gbagada, Lagos 100101, Lagos</li>
            <li className="flex items-center gap-2"><Phone size={16} className="text-primary" /> 0806 585 6429</li>
            <li className="flex items-center gap-2"><Mail size={16} className="text-primary" /> hello@gaspostudios.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white/50 text-sm">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-center md:text-left">
            <p>© {new Date().getFullYear()} Gaspo Studios. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
            </div>
          </div>
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