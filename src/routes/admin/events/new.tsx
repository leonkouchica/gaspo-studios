import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronLeft, Save, Plus, Trash2, GripVertical,
  ImageIcon, Users, Globe, Wifi, Landmark, Info,
} from "lucide-react";

export const Route = createFileRoute("/admin/events/new")({
  component: NewEventPage,
});

const TABS = ["Basic Info", "Details", "Speakers", "Media", "Settings"] as const;
type Tab = (typeof TABS)[number];

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-dark block mb-1.5">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all";
const textareaCls =
  "w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none";

function NewEventPage() {
  const [tab, setTab] = useState<Tab>("Basic Info");
  const [form, setForm] = useState({
    title: "",
    slug: "",
    summary: "",
    category: "",
    type: "physical" as "physical" | "virtual" | "hybrid",
    status: "draft" as "draft" | "published",
    date: "",
    time: "",
    endTime: "",
    venue: "",
    address: "",
    city: "",
    country: "Nigeria",
    description: "",
    objectives: [""],
    topics: [""],
    targetAudience: "",
    bannerImage: "",
    registrationOpen: true,
    registrationDeadline: "",
    capacity: "",
    sponsorshipEnabled: false,
  });

  const set = (field: string, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const addItem = (field: "objectives" | "topics") =>
    setForm((f) => ({ ...f, [field]: [...f[field], ""] }));

  const updateItem = (field: "objectives" | "topics", i: number, val: string) =>
    setForm((f) => ({ ...f, [field]: f[field].map((v, idx) => (idx === i ? val : v)) }));

  const removeItem = (field: "objectives" | "topics", i: number) =>
    setForm((f) => ({ ...f, [field]: f[field].filter((_, idx) => idx !== i) }));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin/events"
          className="w-9 h-9 rounded-xl border border-border bg-white hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-dark transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-dark">Create Event</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Fill in the details to create a new event</p>
        </div>
        <button className="ml-auto inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105">
          <Save size={15} /> Save as Draft
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === t ? "bg-white shadow text-dark" : "text-muted-foreground hover:text-dark"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── BASIC INFO ── */}
      {tab === "Basic Info" && (
        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <FormField label="Event Title" required>
            <input
              value={form.title}
              onChange={(e) => {
                set("title", e.target.value);
                set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
              }}
              placeholder="e.g. Future of AI & Networking 2026"
              className={inputCls}
            />
          </FormField>

          <FormField label="URL Slug" required>
            <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="future-of-ai-networking-2026" className={inputCls} />
          </FormField>

          <FormField label="Summary" required>
            <textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} rows={3} placeholder="A one-paragraph description shown on the events listing page." className={textareaCls} />
          </FormField>

          <div className="grid md:grid-cols-3 gap-4">
            <FormField label="Category" required>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                <option value="">Select category</option>
                {["Technology", "Workshop", "Networking", "Exhibition", "Business", "Photography"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Event Type" required>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inputCls}>
                <option value="physical">🏛 In-Person</option>
                <option value="virtual">💻 Virtual</option>
                <option value="hybrid">🌐 Hybrid</option>
              </select>
            </FormField>

            <FormField label="Status">
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </FormField>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <FormField label="Date" required>
              <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Start Time" required>
              <input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="End Time">
              <input type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} className={inputCls} />
            </FormField>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Venue Name" required>
              <input value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="Eko Hotel & Suites" className={inputCls} />
            </FormField>
            <FormField label="Street Address">
              <input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Plot 1415, Adetokunbo Ademola Street" className={inputCls} />
            </FormField>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="City" required>
              <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Lagos" className={inputCls} />
            </FormField>
            <FormField label="Country">
              <input value={form.country} onChange={(e) => set("country", e.target.value)} className={inputCls} />
            </FormField>
          </div>
        </div>
      )}

      {/* ── DETAILS ── */}
      {tab === "Details" && (
        <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
          <FormField label="Full Description" required>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={8} placeholder="Full event description…" className={textareaCls} />
          </FormField>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-dark">Event Objectives</label>
              <button onClick={() => addItem("objectives")} className="text-xs text-primary hover:underline flex items-center gap-1">
                <Plus size={12} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {form.objectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-2">
                  <GripVertical size={15} className="text-muted-foreground shrink-0" />
                  <input value={obj} onChange={(e) => updateItem("objectives", i, e.target.value)} placeholder={`Objective ${i + 1}`} className={`${inputCls} flex-1`} />
                  {form.objectives.length > 1 && (
                    <button onClick={() => removeItem("objectives", i)} className="text-muted-foreground hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-dark">Topics to be Discussed</label>
              <button onClick={() => addItem("topics")} className="text-xs text-primary hover:underline flex items-center gap-1">
                <Plus size={12} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {form.topics.map((topic, i) => (
                <div key={i} className="flex items-center gap-2">
                  <GripVertical size={15} className="text-muted-foreground shrink-0" />
                  <input value={topic} onChange={(e) => updateItem("topics", i, e.target.value)} placeholder={`Topic ${i + 1}`} className={`${inputCls} flex-1`} />
                  {form.topics.length > 1 && (
                    <button onClick={() => removeItem("topics", i)} className="text-muted-foreground hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <FormField label="Target Audience">
            <textarea value={form.targetAudience} onChange={(e) => set("targetAudience", e.target.value)} rows={3} placeholder="Who should attend this event?" className={textareaCls} />
          </FormField>
        </div>
      )}

      {/* ── SPEAKERS ── */}
      {tab === "Speakers" && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-dark">Keynote Speakers</h3>
            <button className="inline-flex items-center gap-2 bg-muted hover:bg-muted/80 text-dark rounded-xl px-3 py-2 text-sm font-medium">
              <Plus size={14} /> Add Speaker
            </button>
          </div>
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
            <Users size={36} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No speakers added yet</p>
            <p className="text-xs mt-1">Click "Add Speaker" to get started</p>
          </div>
        </div>
      )}

      {/* ── MEDIA ── */}
      {tab === "Media" && (
        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <FormField label="Banner Image URL">
            <input value={form.bannerImage} onChange={(e) => set("bannerImage", e.target.value)} placeholder="https://images.unsplash.com/..." className={inputCls} />
          </FormField>
          {form.bannerImage && (
            <img src={form.bannerImage} alt="Banner preview" className="w-full h-48 object-cover rounded-xl border border-border" />
          )}
          <div className="border-2 border-dashed border-border rounded-2xl p-10 text-center text-muted-foreground hover:border-primary transition-colors cursor-pointer">
            <ImageIcon size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">Gallery images</p>
            <p className="text-xs mt-1">Upload via Supabase Storage in Phase 3</p>
          </div>
        </div>
      )}

      {/* ── SETTINGS ── */}
      {tab === "Settings" && (
        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
            <div>
              <p className="font-semibold text-dark text-sm">Registration Open</p>
              <p className="text-xs text-muted-foreground mt-0.5">Allow attendees to register for this event</p>
            </div>
            <button
              onClick={() => set("registrationOpen", !form.registrationOpen)}
              className={`w-12 h-6 rounded-full transition-all ${form.registrationOpen ? "bg-primary" : "bg-muted-foreground/30"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.registrationOpen ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
            <div>
              <p className="font-semibold text-dark text-sm">Sponsorship Enabled</p>
              <p className="text-xs text-muted-foreground mt-0.5">Show sponsorship packages on the event page</p>
            </div>
            <button
              onClick={() => set("sponsorshipEnabled", !form.sponsorshipEnabled)}
              className={`w-12 h-6 rounded-full transition-all ${form.sponsorshipEnabled ? "bg-primary" : "bg-muted-foreground/30"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.sponsorshipEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Registration Deadline">
              <input type="date" value={form.registrationDeadline} onChange={(e) => set("registrationDeadline", e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Capacity (leave blank for unlimited)">
              <input type="number" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="e.g. 500" className={inputCls} />
            </FormField>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>Preview mode:</strong> Form submissions and status changes won't persist. Connect Supabase in Phase 3 to enable full CRUD functionality.
            </p>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex items-center justify-between pt-2">
        <Link to="/admin/events" className="text-sm text-muted-foreground hover:text-dark flex items-center gap-1">
          <ChevronLeft size={14} /> Back to Events
        </Link>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-dark hover:bg-muted transition-colors">
            Save Draft
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all hover:scale-105">
            Publish Event
          </button>
        </div>
      </div>
    </div>
  );
}
