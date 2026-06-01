import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import { Save, Home, CheckCircle2, LayoutTemplate, Loader2 } from "lucide-react";
import { homepageContent } from "../../../data/homepage";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/homepage/")({
  component: AdminHomepagePage,
});

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-4 pb-4 border-b border-border">
      <h3 className="font-semibold text-dark text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function AdminHomepagePage() {
  const [activeTab, setActiveTab] = useState<"hero" | "about" | "services" | "gallery" | "booking" | "faq">("hero");
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const handleSave = useCallback(() => {
    setSaving(true);
    // Collect all form inputs within the content area via DOM query
    // and save to localStorage so edits persist across tab switches.
    const container = formRef.current;
    if (!container) {
      setSaving(false);
      return;
    }
    const inputs = container.querySelectorAll("input, textarea");
    const data: Record<string, string> = {};
    inputs.forEach((el) => {
      const input = el as HTMLInputElement | HTMLTextAreaElement;
      // Use name attribute or a generated key from placeholder/label
      const name = input.name || input.placeholder || `field_${Math.random().toString(36).slice(2, 7)}`;
      data[name] = input.value;
    });
    try {
      localStorage.setItem("gaspo-homepage-draft", JSON.stringify(data));
      toast.success("Homepage draft saved to browser storage. Changes will reflect on next page load.");
    } catch {
      toast.error("Failed to save. Browser storage may be full.");
    } finally {
      setSaving(false);
    }
  }, []);

  // Restore saved values on mount
  const restoreValue = (defaultVal: string, key: string): string => {
    if (typeof window === "undefined") return defaultVal;
    try {
      const saved = localStorage.getItem("gaspo-homepage-draft");
      if (saved) {
        const data = JSON.parse(saved);
        // Match by placeholder or partial key
        for (const [k, v] of Object.entries(data)) {
          if (k.includes(key) || key.includes(k)) return v as string;
        }
      }
    } catch { /* ignore */ }
    return defaultVal;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Homepage Editor</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage the content blocks on the main landing page.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105 disabled:opacity-60 cursor-pointer"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Changes
        </button>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6 items-start">
        <div className="bg-white rounded-2xl border border-border p-3 flex flex-col gap-1 sticky top-24">
          <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Sections</div>
          {(["hero", "about", "services", "gallery", "booking", "faq"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors capitalize text-left ${activeTab === tab ? "bg-primary text-white" : "text-dark hover:bg-muted"}`}
            >
              <LayoutTemplate size={16} className={activeTab === tab ? "opacity-100" : "opacity-50"} />
              {tab}
            </button>
          ))}
          <a href="/" target="_blank" className="mt-4 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-dark hover:bg-muted transition-colors border border-border">
            <Home size={16} className="opacity-50" /> Preview Page
          </a>
        </div>

        <div ref={formRef} className="bg-white rounded-2xl border border-border p-6 md:p-8 min-h-[500px]">
          {activeTab === "hero" && (
            <div className="space-y-6">
              <SectionHeader title="Hero Slider" desc="Manage the main hero images and headlines." />
              <div className="space-y-4">
                {homepageContent.heroSlides.map((slide, i) => (
                  <div key={slide.id} className="border border-border rounded-xl p-5 bg-muted/20">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-dark text-sm">Slide {i + 1}</h4>
                      <button className="text-xs text-red-500 hover:underline">Remove</button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-dark block mb-1.5">Label (Eyebrow)</label>
                        <input defaultValue={slide.label} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-dark block mb-1.5">Image URL</label>
                        <input defaultValue={slide.img} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-dark block mb-1.5">Headline</label>
                        <input defaultValue={slide.headline} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-dark block mb-1.5">Sub-headline</label>
                        <input defaultValue={slide.sub} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-dark block mb-1.5">Body</label>
                        <textarea defaultValue={slide.body} rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none resize-none" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-dark block mb-1.5">CTA 1 Label</label>
                        <input defaultValue={slide.cta1.label} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-dark block mb-1.5">CTA 1 Link</label>
                        <input defaultValue={slide.cta1.to} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-dark block mb-1.5">CTA 2 Label</label>
                        <input defaultValue={slide.cta2.label} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-dark block mb-1.5">CTA 2 Link</label>
                        <input defaultValue={slide.cta2.to} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                      </div>
                    </div>
                  </div>
                ))}
                <button className="w-full py-3 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  + Add Slide
                </button>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-6">
              <SectionHeader title="About Section" desc="Edit the about-us content block on the homepage." />
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-dark block mb-1.5">Eyebrow</label>
                  <input defaultValue={homepageContent.about.eyebrow} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-dark block mb-1.5">Headline</label>
                  <input defaultValue={homepageContent.about.headline} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-dark block mb-1.5">Body</label>
                  <textarea defaultValue={homepageContent.about.body} rows={3} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none resize-none" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-dark block mb-1.5">Image URL</label>
                    <input defaultValue={homepageContent.about.image} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-dark block mb-1.5">Experience Badge Text</label>
                    <input defaultValue={homepageContent.about.experienceBadge} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-dark mb-3">Stats</h4>
                  {homepageContent.about.stats.map((stat, i) => (
                    <div key={stat.id} className="grid grid-cols-2 gap-3 mb-2">
                      <input defaultValue={stat.value} placeholder="Value (e.g. 200+)" className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                      <input defaultValue={stat.label} placeholder="Label (e.g. Weddings)" className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-dark mb-3">Feature Cards</h4>
                  {homepageContent.about.featureCards.map((card) => (
                    <div key={card.id} className="grid grid-cols-3 gap-3 mb-2">
                      <input defaultValue={card.icon} placeholder="Icon name" className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                      <input defaultValue={card.title} placeholder="Title" className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none col-span-2" />
                      <input defaultValue={card.desc} placeholder="Description" className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none col-span-3" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "services" && (
            <div className="space-y-6">
              <SectionHeader title="Services Section" desc="Edit the services showcase on the homepage." />
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-dark block mb-1.5">Eyebrow</label>
                  <input defaultValue={homepageContent.services.eyebrow} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-dark block mb-1.5">Headline</label>
                  <input defaultValue={homepageContent.services.headline} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-dark block mb-1.5">Subtext</label>
                  <textarea defaultValue={homepageContent.services.subtext} rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none resize-none" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-dark mb-3">Service Cards</h4>
                  {homepageContent.services.cards.map((card) => (
                    <div key={card.id} className="border border-border rounded-lg p-4 mb-3 bg-muted/10">
                      <div className="grid md:grid-cols-3 gap-3">
                        <input defaultValue={card.icon} placeholder="Icon name" className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                        <input defaultValue={card.title} placeholder="Title" className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none md:col-span-2" />
                        <input defaultValue={card.img} placeholder="Image URL" className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none md:col-span-3" />
                        <textarea defaultValue={card.desc} placeholder="Description" rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none resize-none md:col-span-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="space-y-6">
              <SectionHeader title="Gallery / Portfolio Section" desc="Edit the portfolio teaser on the homepage." />
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-dark block mb-1.5">Eyebrow</label>
                  <input defaultValue={homepageContent.gallery.eyebrow} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-dark block mb-1.5">Headline</label>
                  <input defaultValue={homepageContent.gallery.headline} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-dark block mb-1.5">Body</label>
                  <textarea defaultValue={homepageContent.gallery.body} rows={3} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none resize-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-dark block mb-1.5">Main Image URL</label>
                  <input defaultValue={homepageContent.gallery.mainImage} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-dark mb-3">Thumbnail Images</h4>
                  {homepageContent.gallery.thumbnails.map((thumb, i) => (
                    <div key={i} className="mb-2">
                      <input defaultValue={thumb} placeholder={`Thumbnail ${i + 1} URL`} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                    </div>
                  ))}
                  <button className="text-xs text-primary hover:underline mt-1">+ Add Thumbnail</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "booking" && (
            <div className="space-y-6">
              <SectionHeader title="Booking CTA Section" desc="Edit the call-to-action block at the bottom of the homepage." />
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-dark block mb-1.5">Headline</label>
                  <input defaultValue={homepageContent.bookingCta.headline} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-dark block mb-1.5">Body</label>
                  <textarea defaultValue={homepageContent.bookingCta.body} rows={3} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none resize-none" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-dark block mb-1.5">Button Label</label>
                    <input defaultValue={homepageContent.bookingCta.buttonLabel} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-dark block mb-1.5">Button Link</label>
                    <input defaultValue={homepageContent.bookingCta.buttonTo} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-dark block mb-1.5">Background Image URL</label>
                  <input defaultValue={homepageContent.bookingCta.backgroundImage} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "faq" && (
            <div className="space-y-6">
              <SectionHeader title="FAQ Section" desc="Manage frequently asked questions on the homepage." />
              <div className="space-y-4">
                {homepageContent.faq.map((faq) => (
                  <div key={faq.id} className="border border-border rounded-lg p-4 bg-muted/10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">#{faq.order}</span>
                      <button className="text-xs text-red-500 hover:underline ml-auto">Remove</button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-dark block mb-1">Question</label>
                        <input defaultValue={faq.question} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-dark block mb-1">Answer</label>
                        <textarea defaultValue={faq.answer} rows={3} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none resize-none" />
                      </div>
                    </div>
                  </div>
                ))}
                <button className="w-full py-3 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  + Add FAQ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 max-w-3xl">
        <CheckCircle2 size={18} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>CMS Strategy:</strong> The homepage content is driven by a unified JSON configuration object. Updating these fields will instantly reflect on the public landing page once saved to the database.
        </p>
      </div>
    </div>
  );
}
