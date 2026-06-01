import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Save, Home, LayoutTemplate, Loader2 } from "lucide-react";
import { fetchHomepageContent, updateHomepageContent } from "../../../lib/actions/homepage";
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

type Tab = "hero" | "about" | "services" | "gallery" | "booking" | "faq";

function AdminHomepagePage() {
  const [activeTab, setActiveTab] = useState<Tab>("hero");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    fetchHomepageContent()
      .then((data) => setContent(data))
      .catch(() => toast.error("Failed to load homepage content."))
      .finally(() => setLoading(false));
  }, []);

  const update = (path: string, value: any) => {
    setContent((prev: any) => {
      const parts = path.split(".");
      const next = JSON.parse(JSON.stringify(prev));
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        if (!obj[key]) obj[key] = /^\d+$/.test(parts[i + 1]) ? [] : {};
        obj = obj[key];
      }
      obj[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateHomepageContent({ data: { content } });
      toast.success("Homepage content saved successfully!");
    } catch (err: any) {
      toast.error(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Failed to load homepage content.</p>
      </div>
    );
  }

  const inputCls = "w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all";
  const labelCls = "text-xs font-semibold text-dark block mb-1.5";

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

        <div className="bg-white rounded-2xl border border-border p-6 md:p-8 min-h-[500px]">
          {activeTab === "hero" && (
            <div className="space-y-6">
              <SectionHeader title="Hero Slider" desc="Manage the main hero images and headlines." />
              {(content.heroSlides || []).map((slide: any, i: number) => (
                <div key={slide.id || i} className="border border-border rounded-xl p-5 bg-muted/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-dark text-sm">Slide {i + 1}</h4>
                    <button onClick={() => update("heroSlides", (content.heroSlides || []).filter((_: any, j: number) => j !== i))} className="text-xs text-red-500 hover:underline cursor-pointer">Remove</button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><label className={labelCls}>Label</label><input value={slide.label || ""} onChange={(e) => update(`heroSlides.${i}.label`, e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Image URL</label><input value={slide.img || ""} onChange={(e) => update(`heroSlides.${i}.img`, e.target.value)} className={inputCls} /></div>
                    <div className="md:col-span-2"><label className={labelCls}>Headline</label><input value={slide.headline || ""} onChange={(e) => update(`heroSlides.${i}.headline`, e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Sub-headline</label><input value={slide.sub || ""} onChange={(e) => update(`heroSlides.${i}.sub`, e.target.value)} className={inputCls} /></div>
                    <div className="md:col-span-2"><label className={labelCls}>Body</label><textarea value={slide.body || ""} onChange={(e) => update(`heroSlides.${i}.body`, e.target.value)} rows={2} className={inputCls + " resize-none"} /></div>
                    <div><label className={labelCls}>CTA 1 Label</label><input value={slide.cta1?.label || ""} onChange={(e) => update(`heroSlides.${i}.cta1.label`, e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>CTA 1 Link</label><input value={slide.cta1?.to || ""} onChange={(e) => update(`heroSlides.${i}.cta1.to`, e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>CTA 2 Label</label><input value={slide.cta2?.label || ""} onChange={(e) => update(`heroSlides.${i}.cta2.label`, e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>CTA 2 Link</label><input value={slide.cta2?.to || ""} onChange={(e) => update(`heroSlides.${i}.cta2.to`, e.target.value)} className={inputCls} /></div>
                  </div>
                </div>
              ))}
              <button onClick={() => update("heroSlides", [...(content.heroSlides || []), { id: `slide-${Date.now()}`, label: "", headline: "", sub: "", body: "", img: "", cta1: { label: "", to: "" }, cta2: { label: "", to: "" } }])} className="w-full py-3 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">+ Add Slide</button>
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-6">
              <SectionHeader title="About Section" desc="Edit the about-us content block." />
              <div className="space-y-4">
                <div><label className={labelCls}>Eyebrow</label><input value={content.about?.eyebrow || ""} onChange={(e) => update("about.eyebrow", e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Headline</label><input value={content.about?.headline || ""} onChange={(e) => update("about.headline", e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Body</label><textarea value={content.about?.body || ""} onChange={(e) => update("about.body", e.target.value)} rows={3} className={inputCls + " resize-none"} /></div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Image URL</label><input value={content.about?.image || ""} onChange={(e) => update("about.image", e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Experience Badge</label><input value={content.about?.experienceBadge || ""} onChange={(e) => update("about.experienceBadge", e.target.value)} className={inputCls} /></div>
                </div>
                <h4 className="text-sm font-semibold text-dark mb-3">Stats</h4>
                {(content.about?.stats || []).map((stat: any, i: number) => (
                  <div key={stat.id || i} className="grid grid-cols-2 gap-3 mb-2">
                    <input value={stat.value || ""} onChange={(e) => update(`about.stats.${i}.value`, e.target.value)} placeholder="Value" className={inputCls} />
                    <input value={stat.label || ""} onChange={(e) => update(`about.stats.${i}.label`, e.target.value)} placeholder="Label" className={inputCls} />
                  </div>
                ))}
                <h4 className="text-sm font-semibold text-dark mb-3">Feature Cards</h4>
                {(content.about?.featureCards || []).map((card: any, i: number) => (
                  <div key={card.id || i} className="grid grid-cols-3 gap-3 mb-2">
                    <input value={card.icon || ""} onChange={(e) => update(`about.featureCards.${i}.icon`, e.target.value)} placeholder="Icon" className={inputCls} />
                    <input value={card.title || ""} onChange={(e) => update(`about.featureCards.${i}.title`, e.target.value)} placeholder="Title" className={inputCls + " col-span-2"} />
                    <input value={card.desc || ""} onChange={(e) => update(`about.featureCards.${i}.desc`, e.target.value)} placeholder="Description" className={inputCls + " col-span-3"} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "services" && (
            <div className="space-y-6">
              <SectionHeader title="Services Section" desc="Edit the services showcase." />
              <div className="space-y-4">
                <div><label className={labelCls}>Eyebrow</label><input value={content.services?.eyebrow || ""} onChange={(e) => update("services.eyebrow", e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Headline</label><input value={content.services?.headline || ""} onChange={(e) => update("services.headline", e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Subtext</label><textarea value={content.services?.subtext || ""} onChange={(e) => update("services.subtext", e.target.value)} rows={2} className={inputCls + " resize-none"} /></div>
                <h4 className="text-sm font-semibold text-dark mb-3">Service Cards</h4>
                {(content.services?.cards || []).map((card: any, i: number) => (
                  <div key={card.id || i} className="border border-border rounded-lg p-4 mb-3 bg-muted/10">
                    <div className="grid md:grid-cols-3 gap-3">
                      <input value={card.icon || ""} onChange={(e) => update(`services.cards.${i}.icon`, e.target.value)} placeholder="Icon" className={inputCls} />
                      <input value={card.title || ""} onChange={(e) => update(`services.cards.${i}.title`, e.target.value)} placeholder="Title" className={inputCls + " md:col-span-2"} />
                      <input value={card.img || ""} onChange={(e) => update(`services.cards.${i}.img`, e.target.value)} placeholder="Image URL" className={inputCls + " md:col-span-3"} />
                      <textarea value={card.desc || ""} onChange={(e) => update(`services.cards.${i}.desc`, e.target.value)} placeholder="Description" rows={2} className={inputCls + " resize-none md:col-span-3"} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="space-y-6">
              <SectionHeader title="Gallery Section" desc="Edit the portfolio teaser." />
              <div className="space-y-4">
                <div><label className={labelCls}>Eyebrow</label><input value={content.gallery?.eyebrow || ""} onChange={(e) => update("gallery.eyebrow", e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Headline</label><input value={content.gallery?.headline || ""} onChange={(e) => update("gallery.headline", e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Body</label><textarea value={content.gallery?.body || ""} onChange={(e) => update("gallery.body", e.target.value)} rows={3} className={inputCls + " resize-none"} /></div>
                <div><label className={labelCls}>Main Image URL</label><input value={content.gallery?.mainImage || ""} onChange={(e) => update("gallery.mainImage", e.target.value)} className={inputCls} /></div>
                <h4 className="text-sm font-semibold text-dark mb-3">Thumbnails</h4>
                {(content.gallery?.thumbnails || []).map((thumb: string, i: number) => (
                  <div key={i} className="mb-2 flex gap-2">
                    <input value={thumb} onChange={(e) => update(`gallery.thumbnails.${i}`, e.target.value)} placeholder={`Thumbnail ${i + 1}`} className={inputCls + " flex-1"} />
                    <button onClick={() => { const t = [...(content.gallery?.thumbnails || [])]; t.splice(i, 1); update("gallery.thumbnails", t); }} className="text-xs text-red-500 hover:underline shrink-0 cursor-pointer">Remove</button>
                  </div>
                ))}
                <button onClick={() => { const t = [...(content.gallery?.thumbnails || []), ""]; update("gallery.thumbnails", t); }} className="text-xs text-primary hover:underline mt-1 cursor-pointer">+ Add Thumbnail</button>
              </div>
            </div>
          )}

          {activeTab === "booking" && (
            <div className="space-y-6">
              <SectionHeader title="Booking CTA" desc="Edit the call-to-action block." />
              <div className="space-y-4">
                <div><label className={labelCls}>Headline</label><input value={content.bookingCta?.headline || ""} onChange={(e) => update("bookingCta.headline", e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Body</label><textarea value={content.bookingCta?.body || ""} onChange={(e) => update("bookingCta.body", e.target.value)} rows={3} className={inputCls + " resize-none"} /></div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Button Label</label><input value={content.bookingCta?.buttonLabel || ""} onChange={(e) => update("bookingCta.buttonLabel", e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Button Link</label><input value={content.bookingCta?.buttonTo || ""} onChange={(e) => update("bookingCta.buttonTo", e.target.value)} className={inputCls} /></div>
                </div>
                <div><label className={labelCls}>Background Image</label><input value={content.bookingCta?.backgroundImage || ""} onChange={(e) => update("bookingCta.backgroundImage", e.target.value)} className={inputCls} /></div>
              </div>
            </div>
          )}

          {activeTab === "faq" && (
            <div className="space-y-6">
              <SectionHeader title="FAQ Section" desc="Edit frequently asked questions." />
              {(content.faqItems || []).map((item: any, i: number) => (
                <div key={item.id || i} className="border border-border rounded-xl p-4 bg-muted/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-dark">FAQ {i + 1}</h4>
                    <button onClick={() => update("faqItems", (content.faqItems || []).filter((_: any, j: number) => j !== i))} className="text-xs text-red-500 hover:underline cursor-pointer">Remove</button>
                  </div>
                  <input value={item.q || ""} onChange={(e) => update(`faqItems.${i}.q`, e.target.value)} placeholder="Question" className={inputCls} />
                  <textarea value={item.a || ""} onChange={(e) => update(`faqItems.${i}.a`, e.target.value)} rows={2} placeholder="Answer" className={inputCls + " resize-none"} />
                </div>
              ))}
              <button onClick={() => update("faqItems", [...(content.faqItems || []), { id: `faq-${Date.now()}`, q: "", a: "" }])} className="w-full py-3 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">+ Add FAQ Item</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
