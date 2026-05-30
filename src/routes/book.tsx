import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck, Zap, Award } from "lucide-react";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Shoot — Gaspo Studios" },
      { name: "description", content: "Book your photo shoot online. Choose a service, pick a date, and secure your session in minutes." },
      { property: "og:title", content: "Book a Shoot — Gaspo Studios" },
      { property: "og:url", content: "/book" },
    ],
    links: [{ rel: "canonical", href: "/book" }],
  }),
  component: BookPage,
});

const servicesList = [
  { id: "wedding", name: "Wedding Photography", desc: "Full-day coverage with two photographers.", price: "$2,400" },
  { id: "portrait", name: "Portrait Session", desc: "90-minute studio or location session.", price: "$450" },
  { id: "corporate", name: "Corporate Event", desc: "Half-day event coverage + same-day previews.", price: "$1,200" },
  { id: "commercial", name: "Commercial Shoot", desc: "Brand, product or campaign photography.", price: "From $1,800" },
];

const times = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00"];

function BookPage() {
  const [selected, setSelected] = useState("wedding");
  const [date, setDate] = useState(14);
  const [time, setTime] = useState("10:30");
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <>
      <PageHeader title="Book Your Photo Shoot" crumb="Book" subtitle="Simple, convenient, and tailored to your needs." />

      <section className="py-20 md:py-28">
        <div className="container-x grid lg:grid-cols-2 gap-10">
          {/* Service selection */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-dark">Select Your Service</h2>
            <p className="text-muted-foreground mt-2">From wedding photography to corporate events, choose the type of shoot you need.</p>
            <div className="mt-6 space-y-4">
              {servicesList.map((s) => {
                const active = selected === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s.id)}
                    className={`w-full text-left bg-white rounded-2xl p-6 border transition-all ${active ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <span className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? "border-primary" : "border-border"}`}>
                          {active && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </span>
                        <div>
                          <p className="font-semibold text-dark text-lg">{s.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                        </div>
                      </div>
                      <p className="font-bold text-dark whitespace-nowrap">{s.price}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar & form */}
          <div>
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between">
                <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-dark hover:bg-primary hover:text-white transition-colors"><ChevronLeft size={18} /></button>
                <p className="font-semibold text-dark">June 2026</p>
                <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-dark hover:bg-primary hover:text-white transition-colors"><ChevronRight size={18} /></button>
              </div>
              <div className="grid grid-cols-7 gap-1 mt-5 text-xs text-muted-foreground text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="py-2">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((d) => {
                  const unavail = [3, 8, 22].includes(d);
                  const active = date === d;
                  return (
                    <button
                      key={d}
                      disabled={unavail}
                      onClick={() => setDate(d)}
                      className={`aspect-square rounded-full text-sm font-medium transition-all ${
                        active ? "bg-primary text-white scale-100" : unavail ? "text-muted-foreground/40 line-through" : "text-dark hover:bg-muted"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <p className="font-semibold text-dark mb-3">Available time slots</p>
              <div className="flex flex-wrap gap-2">
                {times.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    className={`rounded-full px-4 py-2 text-sm border transition-all ${time === t ? "bg-primary text-white border-primary" : "border-border hover:border-primary"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <form className="mt-6 bg-white rounded-2xl border border-border p-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
              {[
                { l: "Full Name", t: "text", p: "Jane Doe" },
                { l: "Email", t: "email", p: "jane@example.com" },
                { l: "Phone", t: "tel", p: "+1 (555) 000-0000" },
              ].map((f) => (
                <div key={f.l}>
                  <label className="text-sm font-medium text-dark">{f.l}</label>
                  <input type={f.t} placeholder={f.p} className="mt-1.5 w-full rounded-xl border border-border px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-dark">Special requests</label>
                <textarea rows={3} placeholder="Tell us about your vision…" className="mt-1.5 w-full rounded-xl border border-border px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
              </div>

              <div className="rounded-xl bg-muted p-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Deposit (30%)</span>
                <span className="font-bold text-dark">$720</span>
              </div>

              <button className="w-full bg-primary hover:bg-primary-hover transition-colors text-white rounded-full py-4 text-base font-semibold">
                Confirm Booking & Pay Deposit
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/40">
        <div className="container-x grid md:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, t: "Secure Payment", d: "256-bit SSL checkout protected by Stripe." },
            { icon: Zap, t: "Instant Confirmation", d: "You'll receive a confirmation email within seconds." },
            { icon: Award, t: "Satisfaction Guaranteed", d: "Love your photos — or your deposit back, no questions." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="bg-white rounded-2xl p-6 border border-border flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icon size={22} /></div>
              <div>
                <p className="font-semibold text-dark">{t}</p>
                <p className="text-sm text-muted-foreground mt-1">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}