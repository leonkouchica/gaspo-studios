import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  MapPin, CalendarDays, Clock, Users, ArrowRight, Share2,
  Linkedin, Twitter, Facebook, ExternalLink, ChevronDown,
  Check, X, Award, Zap, Network, Lightbulb,
  Globe, Wifi, Landmark, Phone, Mail, Send,
} from "lucide-react";
import { getEventBySlug, type Event, type Speaker, type SponsorPackage } from "../../data/events";
import { ScrollReveal } from "../../components/ScrollReveal";

export const Route = createFileRoute("/events/$eventId")({
  head: ({ params }) => {
    const event = getEventBySlug(params.eventId);
    if (!event) return { meta: [{ title: "Event Not Found" }] };
    
    const pathname = `/events/${params.eventId}`;
    
    return {
      meta: [
        { title: `${event.seo.title || event.title} — Gaspo Studios` },
        { name: "description", content: event.seo.description || event.summary },
        
        /* OpenGraph / Facebook */
        { property: "og:type", content: "website" },
        { property: "og:url", content: `https://gaspotechstudios.com${pathname}` },
        { property: "og:title", content: event.seo.title || event.title },
        { property: "og:description", content: event.seo.description || event.summary },
        { property: "og:image", content: event.seo.ogImage || event.bannerImage },
        
        /* Twitter */
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:url", content: `https://gaspotechstudios.com${pathname}` },
        { name: "twitter:title", content: event.seo.title || event.title },
        { name: "twitter:description", content: event.seo.description || event.summary },
        { name: "twitter:image", content: event.seo.ogImage || event.bannerImage },
      ],
      links: [{ rel: "canonical", href: `https://gaspotechstudios.com${pathname}` }],
    };
  },
  loader: ({ params }) => {
    const event = getEventBySlug(params.eventId);
    if (!event) throw notFound();
    return event;
  },
  component: EventDetailPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-dark text-white text-center px-4">
      <div>
        <h1 className="text-5xl font-bold">Event Not Found</h1>
        <p className="text-white/60 mt-4">This event doesn't exist or has been removed.</p>
        <Link to="/events" className="mt-8 inline-flex items-center gap-2 bg-primary text-white rounded-full px-6 py-3 font-medium">
          Browse Events <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  ),
});

// ─── COUNTDOWN ───────────────────────────────────────────────────────────────
function useCountdown(targetDate: string) {
  const [t, setT] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return setT({ days: 0, hours: 0, mins: 0, secs: 0 });
      setT({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return t;
}

// ─── SPEAKER MODAL ───────────────────────────────────────────────────────────
function SpeakerModal({ speaker, onClose }: { speaker: Speaker; onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] bg-dark/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-8 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-muted hover:bg-destructive hover:text-white text-muted-foreground flex items-center justify-center transition-colors"
        >
          <X size={16} />
        </button>
        <img src={speaker.photo} alt={speaker.name} className="w-24 h-24 rounded-2xl object-cover object-top" />
        <h3 className="text-xl font-bold text-dark mt-4">{speaker.name}</h3>
        <p className="text-primary text-sm font-medium">{speaker.title}</p>
        <p className="text-muted-foreground text-sm">{speaker.company}</p>
        <p className="text-dark text-sm leading-relaxed mt-4">{speaker.bio}</p>
        <div className="flex gap-2 mt-5">
          {speaker.linkedin && (
            <a href={speaker.linkedin} target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-white text-dark flex items-center justify-center transition-colors">
              <Linkedin size={15} />
            </a>
          )}
          {speaker.twitter && (
            <a href={speaker.twitter} target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-white text-dark flex items-center justify-center transition-colors">
              <Twitter size={15} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SPONSORSHIP CARD ────────────────────────────────────────────────────────
function SponsorCard({ pkg }: { pkg: SponsorPackage }) {
  return (
    <div className={`rounded-2xl border p-6 flex flex-col ${pkg.highlighted ? "bg-dark text-white border-primary shadow-xl shadow-primary/20 scale-[1.02]" : "bg-white border-border"}`}>
      {pkg.highlighted && (
        <span className="self-start bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
          ⭐ Most Popular
        </span>
      )}
      <h4 className={`text-lg font-bold ${pkg.highlighted ? "text-white" : "text-dark"}`}>{pkg.name}</h4>
      <p className={`text-3xl font-bold mt-2 ${pkg.highlighted ? "text-primary" : "text-dark"}`}>
        ₦{pkg.price.toLocaleString()}
      </p>
      <ul className="mt-5 space-y-2 flex-1">
        {pkg.benefits.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm">
            <Check size={14} className="text-primary mt-0.5 shrink-0" />
            <span className={pkg.highlighted ? "text-white/80" : "text-muted-foreground"}>{b}</span>
          </li>
        ))}
      </ul>
      <button className={`mt-6 w-full rounded-full py-3 text-sm font-semibold transition-all hover:scale-105 ${pkg.highlighted ? "bg-primary hover:bg-primary-hover text-white" : "border-2 border-dark text-dark hover:bg-dark hover:text-white"}`}>
        Select Package
      </button>
    </div>
  );
}

// ─── REGISTRATION FORM ───────────────────────────────────────────────────────
function RegistrationForm({ event }: { event: Event }) {
  const countdown = useCountdown(`${event.date}T${event.time}`);
  const [submitted, setSubmitted] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", company: "", jobTitle: "",
    country: "", city: "", linkedin: "", howHeard: "", interests: [] as string[],
    questions: "", consent: false,
  });

  const interests = ["AI & Technology", "Business Innovation", "Networking", "Startups & Funding", "Research & Academia"];

  const toggleInterest = (item: string) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(item) ? f.interests.filter((i) => i !== item) : [...f.interests, item],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For Phase 4 demo: always show payment step
    setPaymentStep(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentStep(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-6">
          <Check size={36} />
        </div>
        <h3 className="text-3xl font-bold text-white">You're Registered!</h3>
        <p className="text-white/60 mt-4 max-w-sm mx-auto leading-relaxed">
          Thank you, <strong className="text-white">{form.fullName}</strong>! A confirmation has been sent to <strong className="text-white">{form.email}</strong>. Check your inbox for your attendee ID.
        </p>
      </div>
    );
  }

  if (paymentStep) {
    return (
      <div className="bg-white rounded-3xl p-8 max-w-md mx-auto text-dark animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#0ba4db]/10 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.5 2C6.25 2 2 6.25 2 11.5C2 16.75 6.25 21 11.5 21C16.75 21 21 16.75 21 11.5C21 6.25 16.75 2 11.5 2ZM11.5 19.5C7.08 19.5 3.5 15.92 3.5 11.5C3.5 7.08 7.08 3.5 11.5 3.5C15.92 3.5 19.5 7.08 19.5 11.5C19.5 15.92 15.92 19.5 11.5 19.5Z" fill="#0ba4db"/>
              <path d="M15.53 8.46997H8.46997V10.97H14.03C14.86 10.97 15.53 11.64 15.53 12.47V13.53C15.53 14.36 14.86 15.03 14.03 15.03H8.46997V17.53H15.53C16.36 17.53 17.03 16.86 17.03 16.03V13.53C17.03 12.7 16.36 12.03 15.53 12.03H9.96997V10.97H15.53V8.46997Z" fill="#0ba4db"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold">Paystack Checkout (Mock)</h3>
          <p className="text-sm text-muted-foreground mt-1">{form.email}</p>
        </div>
        
        <div className="bg-muted/50 rounded-2xl p-4 mb-6 border border-border flex justify-between items-center">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total to Pay</p>
            <p className="font-bold text-dark mt-0.5">Event Ticket Fee</p>
          </div>
          <p className="text-xl font-bold text-dark">₦15,000</p>
        </div>

        <button 
          onClick={handlePaymentSuccess}
          className="w-full bg-[#0ba4db] hover:bg-[#0ba4db]/90 text-white rounded-full py-4 font-bold text-base transition-all hover:scale-[1.02]"
        >
          Pay ₦15,000
        </button>
        <button 
          onClick={() => setPaymentStep(false)}
          className="w-full mt-3 text-sm text-muted-foreground hover:text-dark py-2 font-medium"
        >
          Cancel Payment
        </button>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          Secured by Paystack
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
      {/* Countdown */}
      <div>
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { v: countdown.days, l: "Days" },
            { v: countdown.hours, l: "Hours" },
            { v: countdown.mins, l: "Mins" },
            { v: countdown.secs, l: "Secs" },
          ].map(({ v, l }) => (
            <div key={l} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-4xl md:text-5xl font-bold text-white tabular-nums">
                {String(v).padStart(2, "0")}
              </p>
              <p className="text-xs text-white/40 mt-1 uppercase tracking-widest">{l}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {(["fullName", "email", "phone", "company", "jobTitle", "country", "city"] as const).map((field) => (
              <div key={field} className={field === "email" || field === "company" || field === "jobTitle" ? "md:col-span-1" : ""}>
                <label className="text-sm text-white/60 block mb-1.5 capitalize">
                  {field === "fullName" ? "Full Name *" : field === "jobTitle" ? "Job Title *" : `${field.charAt(0).toUpperCase() + field.slice(1)} *`}
                </label>
                <input
                  type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  required={field !== "city"}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder={
                    field === "fullName" ? "Jane Doe" :
                    field === "email" ? "jane@company.com" :
                    field === "phone" ? "+234 800 000 0000" :
                    field === "company" ? "Your Company" :
                    field === "jobTitle" ? "Software Engineer" :
                    field === "country" ? "Nigeria" : "Lagos"
                  }
                />
              </div>
            ))}
            <div>
              <label className="text-sm text-white/60 block mb-1.5">LinkedIn (optional)</label>
              <input
                type="url"
                value={form.linkedin}
                onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/60 block mb-1.5">How did you hear about this event? *</label>
            <select
              value={form.howHeard}
              onChange={(e) => setForm((f) => ({ ...f, howHeard: e.target.value }))}
              required
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:border-primary outline-none"
            >
              <option value="" className="bg-dark">Select an option</option>
              {["Social Media", "Email Newsletter", "Friend / Colleague", "Google Search", "LinkedIn", "Other"].map((o) => (
                <option key={o} value={o} className="bg-dark">{o}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-white/60 block mb-2">Areas of Interest</label>
            <div className="flex flex-wrap gap-2">
              {interests.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleInterest(item)}
                  className={`text-xs rounded-full px-3.5 py-1.5 border transition-all ${form.interests.includes(item) ? "bg-primary border-primary text-white" : "border-white/20 text-white/60 hover:border-primary/50"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-white/60 block mb-1.5">Questions for Speakers (optional)</label>
            <textarea
              value={form.questions}
              onChange={(e) => setForm((f) => ({ ...f, questions: e.target.value }))}
              rows={3}
              className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none resize-none"
              placeholder="Any questions you'd like addressed during the event…"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
              required
              className="mt-0.5 accent-primary"
            />
            <span className="text-sm text-white/60 leading-relaxed">
              I agree to receive event communications and updates from Gaspo Studios. I can unsubscribe at any time.
            </span>
          </label>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white rounded-full py-4 font-bold text-base transition-all hover:scale-[1.02] shadow-lg shadow-primary/30"
          >
            Register Now — It's Free
          </button>
        </form>
      </div>

      {/* Contact card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
        <h4 className="font-bold text-white text-lg">Get In Touch</h4>
        <p className="text-white/60 text-sm leading-relaxed">
          Have questions about the event? We're here to help with registration, partnerships, or any queries.
        </p>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-white/70">
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Mail size={14} />
            </div>
            events@gaspotechstudios.com
          </div>
          <div className="flex items-center gap-3 text-white/70">
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Phone size={14} />
            </div>
            +234 800 GASPO 01
          </div>
          <div className="flex items-center gap-3 text-white/70">
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <MapPin size={14} />
            </div>
            <span>{event.venue},<br />{event.address}</span>
          </div>
        </div>
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-white/40 mb-3">Follow Us</p>
          <div className="flex gap-2">
            {[Linkedin, Twitter, Facebook].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/5 hover:bg-primary text-white/60 hover:text-white flex items-center justify-center transition-colors">
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
function EventDetailPage() {
  const event = Route.useLoaderData();
  if (!event) return null;

  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [agendaOpen, setAgendaOpen] = useState<number | null>(0);

  const TypeIcon = { physical: Landmark, virtual: Wifi, hybrid: Globe }[event.type];
  const typeLabel = { physical: "In-Person", virtual: "Virtual", hybrid: "Hybrid" }[event.type];

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: event.title, url: window.location.href });
    }
  };

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-[calc(65vh+80px)] flex items-end overflow-hidden bg-dark">
        <img src={event.bannerImage} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/70 to-dark/20" />
        <div className="container-x relative z-10 pt-28 pb-14 md:pt-32 w-full">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-primary/20 border border-primary/30 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                {event.category}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs px-3 py-1.5 rounded-full">
                <TypeIcon size={11} /> {typeLabel}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">{event.title}</h1>
            <div className="flex flex-wrap gap-5 mt-5 text-white/70 text-sm">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={15} className="text-primary" />
                {new Date(event.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-primary" />
                {event.time}{event.endTime ? ` – ${event.endTime}` : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={15} className="text-primary" />
                {event.venue}, {event.city}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={15} className="text-primary" />
                {event.registrationCount} registered{event.capacity ? ` / ${event.capacity}` : ""}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mt-7">
              {event.registrationOpen && (
                <a href="#register" className="group inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-7 py-3.5 font-semibold transition-all hover:scale-105 shadow-lg shadow-primary/30">
                  Register Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
              )}
              {event.sponsorshipEnabled && (
                <a href="#sponsorship" className="inline-flex items-center gap-2 text-white border border-white/30 rounded-full px-7 py-3.5 font-medium hover:bg-white/10 transition-all">
                  Become a Sponsor
                </a>
              )}
              <button
                onClick={handleShare}
                className="w-11 h-11 rounded-full border border-white/30 text-white hover:bg-white/10 flex items-center justify-center transition-all"
                aria-label="Share"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL CARDS ── */}
      <section className="bg-dark border-b border-border-dark">
        <div className="container-x py-8">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { tag: "Game-Changing", quote: "The insights shared were groundbreaking. This changed how our entire team thinks about AI strategy.", author: "Sarah M.", role: "CTO, Nexus Labs" },
              { tag: "The Best Event!", quote: "Incredible speakers, top-tier networking, and an agenda that actually delivered value from start to finish.", author: "James K.", role: "VC Partner, AfricaFund" },
              { tag: "Unmatched Opportunities", quote: "I made three strategic partnerships in one afternoon. The ROI on this event was immediate and measurable.", author: "Priya S.", role: "Startup Founder" },
            ].map(({ tag, quote, author, role }) => (
              <div key={tag} className="bg-dark-secondary rounded-2xl border border-border-dark p-5">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">{tag}</span>
                <p className="text-white/80 text-sm mt-3 leading-relaxed line-clamp-3">"{quote}"</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    {author[0]}
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">{author}</p>
                    <p className="text-white/40 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT & AGENDA ── */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container-x">
          <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
            {/* Left — description */}
            <div>
              <ScrollReveal>
                <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium flex items-center gap-3">
                  <span className="inline-block w-6 h-px bg-primary" /> About the Event
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-dark mt-3">{event.title}</h2>
                <div className="text-muted-foreground mt-5 leading-relaxed space-y-4">
                  {event.description.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </ScrollReveal>

              {/* Objectives */}
              {event.objectives.length > 0 && (
                <ScrollReveal delay={100} className="mt-8">
                  <h3 className="font-bold text-dark text-xl mb-4">Event Objectives</h3>
                  <ul className="space-y-2">
                    {event.objectives.map((obj) => (
                      <li key={obj} className="flex items-start gap-3 text-muted-foreground text-sm">
                        <Check size={15} className="text-primary mt-0.5 shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </ScrollReveal>
              )}

              {/* Topics */}
              {event.topics.length > 0 && (
                <ScrollReveal delay={150} className="mt-8">
                  <h3 className="font-bold text-dark text-xl mb-4">Topics to be Discussed</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.topics.map((t) => (
                      <span key={t} className="bg-primary/10 text-primary rounded-full px-3.5 py-1.5 text-sm font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </ScrollReveal>
              )}

              {/* Target Audience */}
              <ScrollReveal delay={200} className="mt-8">
                <div className="bg-muted/50 rounded-2xl p-5 border border-border">
                  <h3 className="font-bold text-dark mb-2">Who Should Attend</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{event.targetAudience}</p>
                </div>
              </ScrollReveal>
            </div>

            {/* Right — Agenda */}
            <div>
              <ScrollReveal>
                <h3 className="font-bold text-dark text-xl mb-5 flex items-center gap-2">
                  <CalendarDays size={18} className="text-primary" /> Event Schedule
                </h3>
              </ScrollReveal>
              <div className="space-y-2">
                {event.agenda.map((item, i) => (
                  <ScrollReveal key={i} delay={i * 40}>
                    <button
                      className="w-full text-left"
                      onClick={() => setAgendaOpen(agendaOpen === i ? null : i)}
                    >
                      <div className={`rounded-xl border transition-all ${agendaOpen === i ? "bg-dark border-dark" : "bg-white border-border hover:border-primary/30"} p-4`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className={`text-xs font-bold ${agendaOpen === i ? "text-primary" : "text-primary"} whitespace-nowrap mt-0.5`}>
                              {item.time}
                            </span>
                            <p className={`font-semibold text-sm ${agendaOpen === i ? "text-white" : "text-dark"}`}>{item.title}</p>
                          </div>
                          {item.description && (
                            <ChevronDown size={15} className={`shrink-0 mt-0.5 transition-transform ${agendaOpen === i ? "rotate-180 text-primary" : "text-muted-foreground"}`} />
                          )}
                        </div>
                        {item.speaker && (
                          <p className={`text-xs mt-1 ml-12 ${agendaOpen === i ? "text-white/50" : "text-muted-foreground"}`}>
                            {item.speaker}
                          </p>
                        )}
                        {agendaOpen === i && item.description && (
                          <p className="text-white/70 text-sm mt-3 ml-12 leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    </button>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY ATTEND ── */}
      <section className="py-20 md:py-28 bg-dark">
        <div className="container-x">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium">Attend</p>
              <h2 className="text-4xl md:text-6xl font-bold text-white mt-3">Why Attend?</h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Lightbulb, num: "01", title: "Cutting-Edge Insights", desc: "Gain frontline knowledge from leading experts reshaping industries with AI and emerging technology." },
              { icon: Zap, num: "02", title: "Hands-On Learning", desc: "Participate in interactive workshops and live demos — walk away with skills you can apply immediately." },
              { icon: Network, num: "03", title: "Exclusive Networking", desc: "Connect with 500+ professionals, investors, and innovators. Build partnerships that last beyond the event." },
              { icon: Award, num: "04", title: "Innovation Showcase", desc: "Discover pioneering startups and products that are defining the future of business and technology." },
            ].map(({ icon: Icon, num, title, desc }, i) => (
              <ScrollReveal key={title} delay={i * 100}>
                <div className="bg-dark-secondary rounded-2xl border border-border-dark p-6 hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon size={22} />
                    </div>
                    <span className="text-5xl font-bold text-white/5">{num}</span>
                  </div>
                  <h4 className="text-white font-bold text-lg">{title}</h4>
                  <p className="text-white/60 text-sm mt-2 leading-relaxed">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── KEYNOTE SPEAKERS ── */}
      {event.speakers.length > 0 && (
        <section className="py-20 md:py-28 bg-background">
          <div className="container-x">
            <ScrollReveal>
              <div className="mb-14">
                <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium flex items-center gap-3">
                  <span className="inline-block w-6 h-px bg-primary" /> Speakers
                </p>
                <h2 className="text-4xl md:text-6xl font-bold text-dark mt-3">Keynote Speakers</h2>
                <p className="text-muted-foreground mt-3">Meet the industry leaders shaping the Future of AI.</p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {event.speakers.map((speaker, i) => (
                <ScrollReveal key={speaker.id} delay={i * 80}>
                  <button
                    onClick={() => setSelectedSpeaker(speaker)}
                    className="group text-left w-full"
                  >
                    <div className="relative overflow-hidden rounded-2xl">
                      <img
                        src={speaker.photo}
                        alt={speaker.name}
                        className="w-full aspect-[3/4] object-cover object-top grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink size={13} className="text-white" />
                      </div>
                    </div>
                    <div className="mt-3 px-1">
                      <p className="font-bold text-dark text-sm">{speaker.name}</p>
                      <p className="text-primary text-xs">{speaker.title}</p>
                      <p className="text-muted-foreground text-xs">{speaker.company}</p>
                    </div>
                  </button>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SPONSORSHIP ── */}
      {event.sponsorshipEnabled && event.sponsorPackages.length > 0 && (
        <section id="sponsorship" className="py-20 md:py-28 bg-muted/40 scroll-mt-20">
          <div className="container-x">
            <ScrollReveal>
              <div className="text-center max-w-2xl mx-auto mb-14">
                <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium">Sponsorship</p>
                <h2 className="text-3xl md:text-5xl font-bold text-dark mt-3">Become a Sponsor</h2>
                <p className="text-muted-foreground mt-4 leading-relaxed">
                  Partner with us to connect your brand with 500+ professionals, decision-makers, and innovators.
                </p>
              </div>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-center">
              {event.sponsorPackages.map((pkg, i) => (
                <ScrollReveal key={pkg.id} delay={i * 60}>
                  <SponsorCard pkg={pkg} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── REGISTER + CONTACT + MAP ── */}
      <section id="register" className="py-20 md:py-28 bg-dark scroll-mt-20">
        <div className="container-x">
          <ScrollReveal>
            <div className="mb-14">
              <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium flex items-center gap-3">
                <span className="inline-block w-6 h-px bg-primary" /> Registration
              </p>
              <h2 className="text-4xl md:text-6xl font-bold text-white mt-3">Register Now</h2>
              <p className="text-white/60 mt-3">Secure your spot — registration is free.</p>
            </div>
          </ScrollReveal>
          <RegistrationForm event={event} />
        </div>
      </section>

      {/* ── CONTACT + MAP ── */}
      <section className="py-20 md:py-28 bg-dark-secondary border-t border-border-dark">
        <div className="container-x">
          <div className="grid lg:grid-cols-2 gap-12">
            <ScrollReveal direction="left">
              <div>
                <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium">Venue</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
                  We're Here To<br />Connect And<br />Assist You
                </h2>
                <p className="text-white/60 mt-5 leading-relaxed">
                  Have questions about the event? We'll help with registration, partnerships, or any other queries. Our team is standing by.
                </p>
                <div className="mt-8 space-y-3">
                  <div className="flex items-center gap-3 text-white/70 text-sm">
                    <span className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                      <MapPin size={15} />
                    </span>
                    <span>
                      <strong className="text-white block">Event Location</strong>
                      {event.venue}, {event.address}, {event.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-white/70 text-sm">
                    <span className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                      <Mail size={15} />
                    </span>
                    events@gaspotechstudios.com
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  {[Linkedin, Twitter, Facebook].map((Icon, i) => (
                    <a key={i} href="#" className="w-9 h-9 rounded-full border border-white/20 hover:border-primary hover:bg-primary text-white/60 hover:text-white flex items-center justify-center transition-all">
                      <Icon size={14} />
                    </a>
                  ))}
                </div>
                <form className="mt-8 space-y-3" onSubmit={(e) => e.preventDefault()}>
                  <input placeholder="Your Name" className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none" />
                  <input type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none" />
                  <textarea rows={3} placeholder="Message" className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none resize-none" />
                  <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white rounded-full py-3 font-semibold text-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                    Send Message <Send size={14} />
                  </button>
                </form>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={150}>
              <div className="rounded-2xl overflow-hidden h-[500px] bg-dark border border-border-dark flex items-center justify-center">
                {event.mapEmbedUrl ? (
                  <iframe
                    src={event.mapEmbedUrl}
                    className="w-full h-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map for ${event.venue}`}
                  />
                ) : (
                  <div className="text-center text-white/40">
                    <MapPin size={40} className="mx-auto mb-3 text-primary/40" />
                    <p className="text-sm">{event.venue}</p>
                    <p className="text-xs mt-1">{event.address}, {event.city}</p>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── BACK LINK ── */}
      <div className="py-8 bg-dark border-t border-border-dark">
        <div className="container-x">
          <Link to="/events" className="inline-flex items-center gap-2 text-white/60 hover:text-primary text-sm transition-colors">
            ← Back to All Events
          </Link>
        </div>
      </div>

      {/* ── SPEAKER MODAL ── */}
      {selectedSpeaker && (
        <SpeakerModal speaker={selectedSpeaker} onClose={() => setSelectedSpeaker(null)} />
      )}
    </>
  );
}
