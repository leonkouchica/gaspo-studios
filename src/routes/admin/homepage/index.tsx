import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save, Home, CheckCircle2, LayoutTemplate } from "lucide-react";
import { homepageContent } from "../../../data/homepage";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Homepage Editor</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage the content blocks on the main landing page.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105">
          <Save size={15} /> Save Changes
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
                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-dark block mb-1.5">Body</label>
                        <textarea defaultValue={slide.body} rows={2} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none resize-none" />
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

          {activeTab !== "hero" && (
            <div className="text-center py-20 text-muted-foreground">
              <LayoutTemplate size={40} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium text-dark">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section</p>
              <p className="text-sm mt-1">Form fields to edit the `{activeTab}` object from `src/data/homepage.ts`.</p>
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
