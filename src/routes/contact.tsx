import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from "lucide-react";
import { PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Gaspo Studios" },
      {
        name: "description",
        content: "Get in touch with Gaspo Studios. We're here to help every step of the way.",
      },
      { property: "og:title", content: "Contact — Gaspo Studios" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

import { useState } from "react";
import { submitContactMessage } from "../lib/actions/contact";
import { toast } from "sonner";

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General inquiry",
    message: "",
  });
  const [errors, setErrors] = useState({ name: "", email: "", phone: "", message: "" });
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = { name: "", email: "", phone: "", message: "" };
    let valid = true;
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
      valid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      valid = false;
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSubmitting(true);
      try {
        await submitContactMessage({
          data: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            message: formData.message,
          },
        });
        setIsSuccess(true);
      } catch (err: any) {
        toast.error(err.message || "Failed to send message. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <>
      <PageHeader
        title="Get in Touch"
        crumb="Contact"
        subtitle="Have questions? We're here to help every step of the way."
        image="/images/photographer_hero.webp"
      />

      <section className="py-20 md:py-28">
        <div className="container-x grid lg:grid-cols-2 gap-10">
          {isSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6">
                <Mail size={32} />
              </div>
              <h2 className="text-2xl font-bold text-green-900">Message Sent Successfully!</h2>
              <p className="text-green-700 mt-3 max-w-md leading-relaxed">
                Thank you, {formData.name}. We've received your request about "{formData.subject}"
                and will get back to you at {formData.email} as soon as possible (usually within 24
                hours).
              </p>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    subject: "General inquiry",
                    message: "",
                  });
                }}
                className="mt-8 bg-green-600 hover:bg-green-700 transition-colors text-white rounded-full px-8 py-3.5 font-semibold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form
              className="bg-white rounded-2xl p-8 border border-border shadow-sm space-y-5"
              onSubmit={handleSubmit}
            >
              <div>
                <p className="uppercase text-xs tracking-[0.25em] text-primary font-medium">
                  Contact form
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-dark mt-2">Send us a message</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-dark">Name</label>
                  <input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`mt-1.5 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all ${errors.name ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"}`}
                    placeholder="Jane Doe"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-dark">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`mt-1.5 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all ${errors.email ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"}`}
                    placeholder="jane@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-dark">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`mt-1.5 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all ${errors.phone ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"}`}
                  placeholder="+1 (555) 000-0000"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-dark">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                >
                  <option>General inquiry</option>
                  <option>Booking question</option>
                  <option>Commercial project</option>
                  <option>Press / media</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-dark">Message</label>
                <textarea
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  className={`mt-1.5 w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none transition-all ${errors.message ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"}`}
                  placeholder="Tell us a little about your project…"
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary-hover transition-all text-white rounded-full py-4 font-semibold shadow-lg shadow-primary/10 hover:shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          )}

          <div className="space-y-4">
            {[
              {
                icon: MapPin,
                t: "Visit Us",
                d: "Phase 2, Charly Boy Bus/Stop, 4a Ajidagan St, Gbagada, Lagos 100101, Lagos",
              },
              { icon: Phone, t: "Call Us", d: "0806 585 6429" },
              { icon: Mail, t: "Email Us", d: "hello@gaspostudios.com" },
            ].map(({ icon: Icon, t, d }) => (
              <div
                key={t}
                className="bg-white rounded-xl p-5 border border-border flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-dark">{t}</p>
                  <p className="text-muted-foreground mt-1 text-sm">{d}</p>
                </div>
              </div>
            ))}

            <iframe
              title="Studio map"
              src="https://www.google.com/maps?q=4a%20Ajidagan%20St,%20Gbagada,%20Lagos&output=embed"
              className="rounded-2xl border border-border h-64 w-full"
              loading="lazy"
            />

            <div className="flex items-center gap-2 pt-2">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-dark text-white hover:bg-primary transition-colors flex items-center justify-center"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
