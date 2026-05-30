import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from "lucide-react";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Gaspo Studios" },
      { name: "description", content: "Get in touch with Gaspo Studios. We're here to help every step of the way." },
      { property: "og:title", content: "Contact — Gaspo Studios" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHeader title="Get in Touch" crumb="Contact" subtitle="Have questions? We're here to help every step of the way." />

      <section className="py-20 md:py-28">
        <div className="container-x grid lg:grid-cols-2 gap-10">
          <form className="bg-white rounded-2xl p-8 border border-border shadow-sm space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium">Contact form</p>
              <h2 className="text-2xl md:text-3xl font-bold text-dark mt-2">Send us a message</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-dark">Name</label>
                <input className="mt-1.5 w-full rounded-xl border border-border px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="text-sm font-medium text-dark">Email</label>
                <input type="email" className="mt-1.5 w-full rounded-xl border border-border px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="jane@example.com" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-dark">Phone</label>
              <input type="tel" className="mt-1.5 w-full rounded-xl border border-border px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <label className="text-sm font-medium text-dark">Subject</label>
              <select className="mt-1.5 w-full rounded-xl border border-border px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white">
                <option>General inquiry</option>
                <option>Booking question</option>
                <option>Commercial project</option>
                <option>Press / media</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-dark">Message</label>
              <textarea rows={5} className="mt-1.5 w-full rounded-xl border border-border px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Tell us a little about your project…" />
            </div>
            <button className="w-full bg-primary hover:bg-primary-hover transition-colors text-white rounded-full py-4 font-semibold">Send Message</button>
          </form>

          <div className="space-y-4">
            {[
              { icon: MapPin, t: "Visit Us", d: "24 Studio Lane, Suite 5, Brooklyn, NY 11201" },
              { icon: Phone, t: "Call Us", d: "+1 (555) 014-2270" },
              { icon: Mail, t: "Email Us", d: "hello@gaspostudios.com" },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="bg-white rounded-xl p-5 border border-border flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icon size={20} /></div>
                <div>
                  <p className="font-semibold text-dark">{t}</p>
                  <p className="text-muted-foreground mt-1 text-sm">{d}</p>
                </div>
              </div>
            ))}

            <iframe
              title="Studio map"
              src="https://www.google.com/maps?q=Brooklyn%20NY&output=embed"
              className="rounded-2xl border border-border h-64 w-full"
              loading="lazy"
            />

            <div className="flex items-center gap-2 pt-2">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-dark text-white hover:bg-primary transition-colors flex items-center justify-center"><Icon size={16} /></a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}