import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronLeft, ChevronRight, ShieldCheck, Zap, Award,
  Camera, Building2, Users, Briefcase, Check, CalendarDays, Clock, ArrowRight,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Service } from "../types";
import { createBooking } from "../lib/actions/bookings";
import { toast } from "sonner";

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

const servicesList: (Service & { icon: React.ElementType; color: string; img: string; includes: string[] })[] = [
  {
    id: "wedding",
    name: "Wedding Photography",
    desc: "Full-day cinematic coverage of your most important day.",
    price: "₦3,600,000",
    icon: Camera,
    color: "text-rose-500 bg-rose-50 border-rose-200",
    img: "/images/wedding_couple.webp",
    includes: ["2 photographers", "8 hours coverage", "600+ edited images", "Online gallery", "Print-ready files"],
  },
  {
    id: "portrait",
    name: "Portrait Session",
    desc: "90-minute studio or location session tailored to you.",
    price: "₦675,000",
    icon: Users,
    color: "text-blue-500 bg-blue-50 border-blue-200",
    img: "/images/portrait_woman.webp",
    includes: ["1 photographer", "90 min session", "50+ edited images", "1 outfit change", "Digital download"],
  },
  {
    id: "corporate",
    name: "Corporate Event",
    desc: "Half-day event coverage with same-day previews.",
    price: "₦1,800,000",
    icon: Building2,
    color: "text-emerald-500 bg-emerald-50 border-emerald-200",
    img: "/images/corporate_team.webp",
    includes: ["1 photographer", "4 hours coverage", "300+ edited images", "Same-day previews", "Commercial license"],
  },
  {
    id: "commercial",
    name: "Commercial Shoot",
    desc: "Brand, product or campaign photography that converts.",
    price: "From ₦2,700,000",
    icon: Briefcase,
    color: "text-violet-500 bg-violet-50 border-violet-200",
    img: "/images/events_crowd.webp",
    includes: ["1–2 photographers", "Full day shoot", "Styled set direction", "Raw + edited files", "Usage license"],
  },
];

const times = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00"];

const prices = {
  wedding: 3_600_000,
  portrait: 675_000,
  corporate: 1_800_000,
  commercial: 2_700_000,
} as const;

const STEPS = ["Service", "Date & Time", "Your Details", "Confirm"];

function BookPage() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<keyof typeof prices>("wedding");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1));
  const [date, setDate] = useState<number | null>(14);
  const [time, setTime] = useState("10:30");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState({ name: "", email: "", phone: "" });
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const yearNum = currentDate.getFullYear();
  const monthNum = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(yearNum, monthNum + 1, 0).getDate();
  const firstDayIndex = new Date(yearNum, monthNum, 1).getDay();
  const blanks = Array.from({ length: firstDayIndex }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => { setCurrentDate(new Date(yearNum, monthNum - 1, 1)); setDate(null); };
  const handleNextMonth = () => { setCurrentDate(new Date(yearNum, monthNum + 1, 1)); setDate(null); };

  const totalPrice = prices[selected];
  const depositPrice = Math.round(totalPrice * 0.3);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = { name: "", email: "", phone: "" };
    let valid = true;
    if (!formData.name.trim()) { newErrors.name = "Full name is required"; valid = false; }
    if (!formData.email.trim()) { newErrors.email = "Email address is required"; valid = false; }
    else if (!/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = "Please enter a valid email"; valid = false; }
    if (!formData.phone.trim()) { newErrors.phone = "Phone number is required"; valid = false; }
    setErrors(newErrors);
    return valid;
  };

  const selectedService = servicesList.find((s) => s.id === selected)!;

  const handleFinalSubmit = async () => {
    if (validate()) {
      setSubmitting(true);
      try {
        const monthString = String(monthNum + 1).padStart(2, "0");
        const dayString = String(date || 1).padStart(2, "0");
        const preferredDate = `${yearNum}-${monthString}-${dayString}`;

        await createBooking({
          data: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            service: selectedService.name,
            package: selectedService.id === "wedding" ? "Full Day Coverage" :
                     selectedService.id === "portrait" ? "Tailored Session" :
                     selectedService.id === "corporate" ? "Half Day Coverage" : "Standard Package",
            preferredDate,
            preferredTime: time,
            message: formData.message,
            totalValue: totalPrice,
          }
        });
        setIsSuccess(true);
      } catch (err: any) {
        toast.error(err.message || "Failed to submit booking. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <>
      <PageHeader
        title="Book Your Photo Shoot"
        crumb="Book"
        subtitle="Simple, convenient, and tailored to your needs."
        image="/images/photographer_hero.webp"
      />

      <section className="py-20 md:py-28 bg-background">
        <div className="container-x max-w-5xl">

          {/* ── Step progress bar ── */}
          <div className="mb-12">
            <div className="flex items-center justify-between relative">
              {/* connector line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-0" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 -z-0"
                style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
              />
              {STEPS.map((label, i) => (
                <div key={label} className="flex flex-col items-center gap-2 z-10">
                  <button
                    onClick={() => i < step && setStep(i)}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
                      i < step
                        ? "bg-primary border-primary text-white"
                        : i === step
                        ? "bg-white border-primary text-primary shadow-lg shadow-primary/20"
                        : "bg-white border-border text-muted-foreground"
                    }`}
                  >
                    {i < step ? <Check size={16} /> : i + 1}
                  </button>
                  <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-primary" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Step panels ── */}

          {/* STEP 0 — SELECT SERVICE */}
          {step === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-dark">What are you looking for?</h2>
                <p className="text-muted-foreground mt-2">Choose the photography service that fits your needs.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                {servicesList.map((s) => {
                  const Icon = s.icon;
                  const active = selected === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelected(s.id as keyof typeof prices)}
                      className={`group relative text-left rounded-3xl border-2 overflow-hidden transition-all duration-300 ${
                        active ? "border-primary shadow-xl shadow-primary/10 scale-[1.01]" : "border-border hover:border-primary/50 hover:shadow-md"
                      }`}
                    >
                      {/* Image */}
                      <div className="relative h-44 overflow-hidden">
                        <img src={s.img} alt={s.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />
                        {active && (
                          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                        <div className={`absolute bottom-3 left-3 w-9 h-9 rounded-xl flex items-center justify-center border ${s.color}`}>
                          <Icon size={18} />
                        </div>
                      </div>
                      {/* Text */}
                      <div className="p-5 bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-dark text-lg">{s.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                          </div>
                          <p className="font-bold text-primary text-sm whitespace-nowrap mt-0.5">{s.price}</p>
                        </div>
                        <ul className="mt-4 space-y-1.5">
                          {s.includes.map((item) => (
                            <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="w-3.5 h-3.5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Check size={9} />
                              </span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="group inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-8 py-3.5 font-semibold transition-all hover:scale-105 shadow-lg shadow-primary/20"
                >
                  Next: Pick a Date
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 1 — DATE & TIME */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-dark">When works for you?</h2>
                <p className="text-muted-foreground mt-2">Choose an available date and your preferred time slot.</p>
              </div>
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <button onClick={handlePrevMonth} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-dark hover:bg-primary hover:text-white transition-colors">
                      <ChevronLeft size={18} />
                    </button>
                    <p className="font-semibold text-dark">{monthName} {yearNum}</p>
                    <button onClick={handleNextMonth} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-dark hover:bg-primary hover:text-white transition-colors">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground text-center mb-2">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="py-2 font-medium">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {blanks.map((b) => <div key={`blank-${b}`} className="aspect-square" />)}
                    {days.map((d) => {
                      const unavail = monthNum === 5 && [3, 8, 22].includes(d);
                      const active = date === d;
                      return (
                        <button
                          key={d}
                          disabled={unavail}
                          onClick={() => setDate(d)}
                          className={`aspect-square rounded-full text-sm font-medium transition-all ${
                            active ? "bg-primary text-white font-bold" : unavail ? "text-muted-foreground/30 line-through cursor-not-allowed" : "text-dark hover:bg-muted"
                          }`}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slots + summary */}
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl border border-border p-6 shadow-sm">
                    <p className="font-semibold text-dark mb-4 flex items-center gap-2">
                      <Clock size={16} className="text-primary" /> Available Time Slots
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {times.map((t) => (
                        <button
                          key={t}
                          onClick={() => setTime(t)}
                          className={`rounded-full py-2.5 text-sm border transition-all font-medium ${
                            time === t ? "bg-primary text-white border-primary shadow-md shadow-primary/20" : "border-border hover:border-primary text-dark"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mini booking summary */}
                  {date && (
                    <div className="bg-dark rounded-3xl p-6 text-white">
                      <p className="text-xs uppercase tracking-widest text-white/50 mb-3">Your Selection</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarDays size={14} className="text-primary" />
                          <span>{monthName} {date}, {yearNum}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={14} className="text-primary" />
                          <span>{time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Camera size={14} className="text-primary" />
                          <span>{selectedService.name}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-8">
                <button onClick={() => setStep(0)} className="flex items-center gap-2 text-muted-foreground hover:text-dark transition-colors">
                  <ChevronLeft size={18} /> Back
                </button>
                <button
                  onClick={() => {
                    if (!date) { alert("Please select a date."); return; }
                    setStep(2);
                  }}
                  className="group inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-8 py-3.5 font-semibold transition-all hover:scale-105 shadow-lg shadow-primary/20"
                >
                  Next: Your Details
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — YOUR DETAILS */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-dark">Tell us about yourself</h2>
                <p className="text-muted-foreground mt-2">So we can reach you with confirmation details.</p>
              </div>
              <div className="grid lg:grid-cols-[1fr_360px] gap-8">
                <div className="bg-white rounded-3xl border border-border p-8 shadow-sm space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-dark block mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Jane Doe"
                      className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all ${errors.name ? "border-red-500" : "border-border focus:border-primary"}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-dark block mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="jane@example.com"
                      className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all ${errors.email ? "border-red-500" : "border-border focus:border-primary"}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-dark block mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+234 800 000 0000"
                      className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all ${errors.phone ? "border-red-500" : "border-border focus:border-primary"}`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-dark block mb-1.5">Special Requests <span className="font-normal text-muted-foreground">(optional)</span></label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Tell us your vision, preferred locations, or anything you'd like us to know…"
                      className="w-full rounded-xl border border-border px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Booking summary sidebar */}
                <div className="bg-dark text-white rounded-3xl p-6 h-fit sticky top-28">
                  <p className="text-xs uppercase tracking-widest text-white/50 mb-5">Booking Summary</p>
                  <img src={selectedService.img} alt={selectedService.name} className="w-full h-32 object-cover rounded-2xl mb-5" />
                  <p className="font-bold text-lg">{selectedService.name}</p>
                  <div className="mt-4 space-y-2 text-sm text-white/70">
                    <div className="flex items-center gap-2"><CalendarDays size={13} className="text-primary" /> {monthName} {date}, {yearNum}</div>
                    <div className="flex items-center gap-2"><Clock size={13} className="text-primary" /> {time}</div>
                  </div>
                  <div className="border-t border-white/10 mt-5 pt-5">
                    <div className="flex justify-between text-sm text-white/60">
                      <span>Total</span>
                      <span>₦{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-2">
                      <span>Deposit (30%)</span>
                      <span className="text-primary">₦{depositPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 text-muted-foreground hover:text-dark transition-colors">
                  <ChevronLeft size={18} /> Back
                </button>
                <button
                  onClick={() => { if (validate()) setStep(3); }}
                  className="group inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-8 py-3.5 font-semibold transition-all hover:scale-105 shadow-lg shadow-primary/20"
                >
                  Review & Confirm
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — CONFIRM */}
          {step === 3 && !isSuccess && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-dark">Review your booking</h2>
                <p className="text-muted-foreground mt-2">Check everything looks right before we confirm.</p>
              </div>
              <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
                <img src={selectedService.img} alt={selectedService.name} className="w-full h-48 object-cover" />
                <div className="p-8 space-y-5">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {[
                      ["Service", selectedService.name],
                      ["Date", `${monthName} ${date}, ${yearNum}`],
                      ["Time", time],
                      ["Name", formData.name],
                      ["Email", formData.email],
                      ["Phone", formData.phone],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-muted-foreground text-xs uppercase tracking-widest">{label}</p>
                        <p className="font-semibold text-dark mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                  {formData.message && (
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-widest">Special Requests</p>
                      <p className="text-dark mt-1 text-sm">{formData.message}</p>
                    </div>
                  )}
                  <div className="rounded-2xl bg-muted p-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Deposit Due Today (30%)</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">Full total: ₦{totalPrice.toLocaleString()}</p>
                    </div>
                    <p className="text-2xl font-bold text-dark">₦{depositPrice.toLocaleString()}</p>
                  </div>
                  <button
                    disabled={submitting}
                    onClick={handleFinalSubmit}
                    className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 transition-all text-white rounded-full py-4 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    {submitting ? "Confirming Booking..." : "Confirm Booking & Pay Deposit"}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-center mt-6">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 text-muted-foreground hover:text-dark transition-colors text-sm">
                  <ChevronLeft size={16} /> Edit Details
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS STATE */}
          {isSuccess && (
            <div className="animate-in fade-in zoom-in-95 duration-400 max-w-lg mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={36} />
              </div>
              <h3 className="text-3xl font-bold text-dark">Booking Confirmed!</h3>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                Thank you, <strong>{formData.name}</strong>! We've received your{" "}
                <strong>{selectedService.name}</strong> request for{" "}
                <strong>{monthName} {date}, {yearNum}</strong> at <strong>{time}</strong>.
                A confirmation email has been sent to <strong>{formData.email}</strong>.
              </p>
              <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-700">
                Our team will reach out within 24 hours to finalise the details and share payment instructions.
              </div>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setStep(0);
                  setFormData({ name: "", email: "", phone: "", message: "" });
                }}
                className="mt-8 bg-primary hover:bg-primary-hover text-white rounded-full px-8 py-3.5 font-semibold transition-all hover:scale-105"
              >
                Book Another Shoot
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="pt-4 pb-8 bg-muted/40">
        <div className="container-x grid md:grid-cols-3 gap-3">
          {[
            { icon: ShieldCheck, t: "Secure Payment", d: "256-bit SSL checkout — your data is always protected." },
            { icon: Zap, t: "Instant Confirmation", d: "You'll receive a confirmation email within seconds." },
            { icon: Award, t: "Satisfaction Guaranteed", d: "Love your photos — or your deposit back, no questions." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="bg-white rounded-2xl p-4 border border-border flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <p className="font-semibold text-dark text-sm">{t}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}