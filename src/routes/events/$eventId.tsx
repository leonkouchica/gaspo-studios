import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  MapPin, CalendarDays, Clock, Users, ArrowRight, Share2,
  Linkedin, Twitter, Facebook, ExternalLink, ChevronDown,
  Check, X, Award, Zap, Network, Lightbulb,
  Globe, Wifi, Landmark, Phone, Mail, Send, Loader2, CreditCard,
} from "lucide-react";
import { type Event, type Speaker, type SponsorPackage } from "../../data/events";
import { fetchEvent, registerForEvent } from "../../lib/actions/events";
import { initSponsorPayment } from "../../lib/actions/sponsors";
import { ShareButton } from "../../components/ShareButton";
import { ScrollReveal } from "../../components/ScrollReveal";

export const Route = createFileRoute("/events/$eventId")({
  loader: async ({ params }) => {
    try {
      const event = await fetchEvent({ data: { slug: params.eventId } });
      if (!event) throw notFound();
      return event;
    } catch (err) {
      throw notFound();
    }
  },
  head: ({ loaderData: event }) => {
    if (!event) return { meta: [{ title: "Event Not Found" }] };
    
    const pathname = `/events/${event.slug}`;
    
    return {
      meta: [
        { title: `${event.seo?.title || event.title} — Gaspo Studios` },
        { name: "description", content: event.seo?.description || event.summary },
        
        /* OpenGraph / Facebook */
        { property: "og:type", content: "website" },
        { property: "og:url", content: `https://gaspotechstudios.com${pathname}` },
        { property: "og:title", content: event.seo?.title || event.title },
        { property: "og:description", content: event.seo?.description || event.summary },
        { property: "og:image", content: event.seo?.ogImage || event.bannerImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        
        /* Twitter */
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:url", content: `https://gaspotechstudios.com${pathname}` },
        { name: "twitter:title", content: event.seo?.title || event.title },
        { name: "twitter:description", content: event.seo?.description || event.summary },
        { name: "twitter:image", content: event.seo?.ogImage || event.bannerImage },
      ],
      links: [{ rel: "canonical", href: `https://gaspotechstudios.com${pathname}` }],
    };
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

function useCountdown(targetDate: string) {
  const calc = () => {
    let time = new Date(targetDate).getTime();
    if (isNaN(time)) {
      const cleanDate = targetDate.replace(/T(undefined|null)?$/, "").replace(/T$/, "");
      time = new Date(cleanDate).getTime();
      if (isNaN(time)) {
        const safeDate = cleanDate.replace(/-/g, "/").replace("T", " ");
        time = new Date(`${safeDate}:00`).getTime();
        if (isNaN(time)) time = new Date(safeDate).getTime();
      }
    }
    
    const diff = time - Date.now();
    if (isNaN(diff) || diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins: Math.floor((diff % 3600000) / 60000),
      secs: Math.floor((diff % 60000) / 1000),
    };
  };

  const [t, setT] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setT(calc());
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return mounted ? t : { days: 0, hours: 0, mins: 0, secs: 0 };
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
function SponsorCard({ pkg, onSelect }: { pkg: SponsorPackage; onSelect: (pkg: SponsorPackage) => void }) {
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
      <button
        onClick={() => onSelect(pkg)}
        className={`mt-6 w-full block text-center rounded-full py-3 text-sm font-semibold transition-all hover:scale-105 ${pkg.highlighted ? "bg-primary hover:bg-primary-hover text-white" : "border-2 border-dark text-dark hover:bg-dark hover:text-white"}`}
      >
        Select Package
      </button>
    </div>
  );
}

// ─── SPONSOR CHECKOUT ────────────────────────────────────────────────────────
function SponsorCheckout({ event, pkg, onBack, onSuccess }: { event: Event; pkg: SponsorPackage; onBack: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<"info" | "confirm" | "paying">("info");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const handleProceed = async () => {
    if (!form.companyName || !form.contactName || !form.contactEmail || !form.contactPhone) {
      toast.error("Please fill in all fields.");
      return;
    }
    setStep("confirm");
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      const result = await initSponsorPayment({
        data: {
          eventId: event.id,
          companyName: form.companyName,
          contactName: form.contactName,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone,
          packageId: pkg.id,
          packageName: pkg.name,
          packagePrice: pkg.price,
        },
      });
      const res = result as any;
      if (res.isMock) {
        toast.success("Payment simulated! Sponsor record created.");
        onSuccess();
      } else {
        window.location.href = res.authorizationUrl;
      }
    } catch (err: any) {
      toast.error(`Payment initiation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 max-w-lg mx-auto text-dark animate-in fade-in zoom-in-95 duration-300">
      {step === "info" && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={onBack} className="w-8 h-8 rounded-full bg-muted hover:bg-dark hover:text-white flex items-center justify-center transition-colors">
              <X size={14} />
            </button>
            <div>
              <h3 className="font-bold text-lg">Sponsor This Event</h3>
              <p className="text-sm text-muted-foreground">{pkg.name} — ₦{pkg.price.toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { key: "companyName", label: "Company Name *", placeholder: "Your Company Ltd" },
              { key: "contactName", label: "Contact Person *", placeholder: "Full Name" },
              { key: "contactEmail", label: "Email Address *", placeholder: "you@company.com", type: "email" },
              { key: "contactPhone", label: "Phone Number *", placeholder: "+234 800 000 0000", type: "tel" },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="text-sm font-semibold text-dark block mb-1.5">{label}</label>
                <input
                  type={type || "text"}
                  value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder={placeholder}
                />
              </div>
            ))}
            <button
              onClick={handleProceed}
              className="w-full bg-primary hover:bg-primary-hover text-white rounded-full py-3.5 font-bold text-base transition-all hover:scale-[1.02]"
            >
              Continue to Review
            </button>
          </div>
        </>
      )}

      {step === "confirm" && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep("info")} className="w-8 h-8 rounded-full bg-muted hover:bg-dark hover:text-white flex items-center justify-center transition-colors">
              <ArrowRight size={14} className="rotate-180" />
            </button>
            <h3 className="font-bold text-lg">Confirm Sponsorship</h3>
          </div>
          <div className="space-y-3 mb-6">
            <div className="bg-muted/50 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Event</span><span className="font-semibold">{event.title}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Package</span><span className="font-semibold">{pkg.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Company</span><span className="font-semibold">{form.companyName}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Contact</span><span className="font-semibold">{form.contactName}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Email</span><span className="font-semibold">{form.contactEmail}</span></div>
              <hr className="border-border" />
              <div className="flex justify-between text-base"><span className="font-bold">Total</span><span className="font-bold text-primary">₦{pkg.price.toLocaleString()}</span></div>
            </div>
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white rounded-full py-3.5 font-bold text-base transition-all hover:scale-[1.02] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
              {loading ? "Processing…" : `Pay ₦${pkg.price.toLocaleString()}`}
            </button>
            <p className="text-xs text-muted-foreground text-center">Secured by Paystack • You'll be redirected to complete payment</p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── REGISTRATION FORM ───────────────────────────────────────────────────────
function RegistrationForm({ event }: { event: Event }) {
  const countdown = useCountdown(`${event.date}T${event.time}`);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.phone || !form.company || !form.jobTitle || !form.country || !form.city || !form.howHeard) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!form.consent) {
      toast.error("Please agree to receive event communications.");
      return;
    }

    setSubmitting(true);
    try {
      await registerForEvent({
        data: {
          eventId: event.id,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          company: form.company,
          jobTitle: form.jobTitle,
          country: form.country,
          city: form.city,
          linkedin: form.linkedin || undefined,
          howHeard: form.howHeard,
          registrationType: "participant",
          eventInterest: form.interests,
        },
      });
      setSubmitted(true);
      toast.success("Registration successful! Check your email for confirmation.");
    } catch (err: any) {
      toast.error(`Registration failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
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
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary-hover text-white rounded-full py-4 font-bold text-base transition-all hover:scale-[1.02] shadow-lg shadow-primary/30 disabled:opacity-60 disabled:pointer-events-none"
          >
            {submitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Register Now — It's Free"}
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
  const [sponsorStep, setSponsorStep] = useState<"select" | "checkout" | "success">("select");
  const [selectedPackage, setSelectedPackage] = useState<SponsorPackage | null>(null);

  const TypeIcon = { physical: Landmark, virtual: Wifi, hybrid: Globe }[event.type];
  const typeLabel = { physical: "In-Person", virtual: "Virtual", hybrid: "Hybrid" }[event.type];

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-[calc(65vh+80px)] flex items-end overflow-hidden bg-dark">
        <img src={event.bannerImage} alt={event.title} className="absolute inset-0 w-full h-full object-cover object-top" />
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
              <ShareButton
                title={event.title}
                summary={event.summary}
                variant="dark"
              />
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
      <section className="py-16 md:py-20 bg-background">
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
      {event.whyAttendEnabled !== false && (
        <section className="py-16 md:py-20 bg-dark">
          <div className="container-x">
            <ScrollReveal>
              <div className="text-center max-w-2xl mx-auto mb-10">
                <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium">Attend</p>
                <h2 className="text-4xl md:text-6xl font-bold text-white mt-3">Why Attend?</h2>
              </div>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {(event.whyAttendItems?.length ? event.whyAttendItems : [
                { icon: Lightbulb, title: "Cutting-Edge Insights", description: "Gain frontline knowledge from leading experts reshaping industries with AI and emerging technology." },
                { icon: Zap, title: "Hands-On Learning", description: "Participate in interactive workshops and live demos — walk away with skills you can apply immediately." },
                { icon: Network, title: "Exclusive Networking", description: "Connect with 500+ professionals, investors, and innovators. Build partnerships that last beyond the event." },
                { icon: Award, title: "Innovation Showcase", description: "Discover pioneering startups and products that are defining the future of business and technology." },
              ]).map((item, i) => {
                const Icon = (item as any).icon || Lightbulb; // default icon if none provided
                const num = String(i + 1).padStart(2, "0");
                return (
                <ScrollReveal key={item.title} delay={i * 100}>
                  <div className="bg-dark-secondary rounded-2xl border border-border-dark p-6 hover:-translate-y-1 transition-all duration-300 group h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <Icon size={22} />
                      </div>
                      <span className="text-5xl font-bold text-white/5">{num}</span>
                    </div>
                    <h4 className="text-white font-bold text-lg">{item.title}</h4>
                    <p className="text-white/60 text-sm mt-2 leading-relaxed">{item.description}</p>
                  </div>
                </ScrollReveal>
              )})}
            </div>
          </div>
        </section>
      )}

      {/* ── KEYNOTE SPEAKERS ── */}
      {event.speakers.length > 0 && (
        <section className="py-16 md:py-20 bg-background">
          <div className="container-x">
            <ScrollReveal>
              <div className="mb-10">
                <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium flex items-center gap-3">
                  <span className="inline-block w-6 h-px bg-primary" /> Speakers
                </p>
                <h2 className="text-4xl md:text-6xl font-bold text-dark mt-3">Keynote Speakers</h2>
                <p className="text-muted-foreground mt-3">
                  {event.speakerSubtitle || "Meet the industry leaders shaping the future."}
                </p>
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
      {/* ── EVENT SCHEDULE / AGENDA ── */}
      {event.agenda && event.agenda.length > 0 && (
        <section className="py-16 md:py-20 bg-dark text-white">
          <div className="container-x">
            <ScrollReveal>
              <div className="text-center max-w-2xl mx-auto mb-10">
                <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium">Agenda</p>
                <h2 className="text-4xl md:text-5xl font-bold mt-3">Event Schedule</h2>
              </div>
            </ScrollReveal>
            <div className="max-w-4xl mx-auto space-y-6">
              {event.agenda.map((item, i) => (
                <ScrollReveal key={item.id} delay={i * 80}>
                  <div className="flex flex-col md:flex-row gap-4 md:gap-8 bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-colors">
                    <div className="shrink-0 md:w-32">
                      <p className="text-primary font-bold text-xl">{item.time}</p>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{item.title}</h4>
                      {item.speaker && (
                        <p className="text-sm font-semibold text-white/80 mt-1">Speaker: {item.speaker}</p>
                      )}
                      {item.description && (
                        <p className="text-sm text-white/60 mt-2 leading-relaxed">{item.description}</p>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SPONSOR LOGOS ── */}
      {event.sponsorLogos && event.sponsorLogos.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-x text-center">
            <ScrollReveal>
              <p className="uppercase text-xs tracking-[0.25em] text-muted-foreground font-semibold mb-8">Sponsors & Partners</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                {event.sponsorLogos.map((logo, i) => (
                  <img key={i} src={logo} alt="Sponsor Logo" className="h-16 md:h-20 object-contain grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100" />
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ── SPONSORSHIP ── */}
      {event.sponsorshipEnabled && event.sponsorPackages.length > 0 && (
        <section id="sponsorship" className="py-16 md:py-20 bg-muted/40 scroll-mt-20">
          <div className="container-x">
            <ScrollReveal>
              <div className="text-center max-w-2xl mx-auto mb-10">
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
                  <SponsorCard pkg={pkg} onSelect={(pkg) => { setSelectedPackage(pkg); setSponsorStep("checkout"); }} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── REGISTER + CONTACT + MAP ── */}
      <section id="register" className="py-16 md:py-20 bg-dark scroll-mt-20">
        <div className="container-x">
          <ScrollReveal>
            <div className="mb-10">
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
      <section id="contact" className="py-16 md:py-20 bg-dark-secondary border-t border-border-dark scroll-mt-20">
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

      {/* ── SPONSOR CHECKOUT MODAL ── */}
      {sponsorStep === "checkout" && selectedPackage && (
        <div className="fixed inset-0 z-[70] bg-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
          <SponsorCheckout
            event={event}
            pkg={selectedPackage}
            onBack={() => { setSponsorStep("select"); setSelectedPackage(null); }}
            onSuccess={() => setSponsorStep("success")}
          />
        </div>
      )}

      {/* ── SPONSOR SUCCESS ── */}
      {sponsorStep === "success" && (
        <div className="fixed inset-0 z-[70] bg-dark/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-6">
              <Check size={36} />
            </div>
            <h3 className="text-2xl font-bold text-dark">Sponsorship Confirmed!</h3>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              Thank you for sponsoring <strong>{event.title}</strong> as a <strong>{selectedPackage?.name}</strong>.
              A confirmation email will be sent to your inbox shortly.
            </p>
            <button
              onClick={() => { setSponsorStep("select"); setSelectedPackage(null); }}
              className="mt-6 bg-primary hover:bg-primary-hover text-white rounded-full px-8 py-3 font-semibold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── SPONSOR SUCCESS INLINE ── */}
      {sponsorStep === "success" && event.sponsorshipEnabled && event.sponsorPackages.length > 0 && (
        <section className="py-16 md:py-20 bg-green-50">
          <div className="container-x text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-6">
              <Check size={36} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-dark">Thank You for Your Sponsorship!</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
              Your sponsorship for <strong>{event.title}</strong> has been received. We'll be in touch with event details and your sponsorship benefits soon.
            </p>
            <a href="#register" className="mt-6 inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-7 py-3.5 font-semibold transition-all">
              Register to Attend <ArrowRight size={16} />
            </a>
          </div>
        </section>
      )}
    </>
  );
}
