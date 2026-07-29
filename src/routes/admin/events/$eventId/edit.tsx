import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft, Save, Plus, Trash2, GripVertical, Pencil,
  ImageIcon, Users, Globe, Wifi, Landmark, Info, Loader2, Upload
} from "lucide-react";
import { fetchEvent, updateEvent, uploadEventImage } from "../../../../lib/actions/events";
import { arrayBufferToBase64 } from "../../../../lib/base64";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/events/$eventId/edit")({
  loader: async ({ params }) => {
    try {
      const event = await fetchEvent({ data: { id: params.eventId } });
      if (!event) throw notFound();
      return event;
    } catch (err) {
      throw notFound();
    }
  },
  component: EditEventPage,
  notFoundComponent: () => (
    <div className="text-center py-20 bg-muted/20 min-h-screen flex flex-col items-center justify-center">
      <p className="text-muted-foreground font-semibold text-lg">Event not found.</p>
      <Link to="/admin/events" className="text-primary mt-4 inline-block hover:underline font-medium">
        ← Back to Events
      </Link>
    </div>
  ),
});

const TABS = ["Basic Info", "Details", "Speakers", "Media", "Agenda", "Why Attend", "Settings"] as const;
type Tab = (typeof TABS)[number];

interface Speaker {
  id: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  photo: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
}

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

function EditEventPage() {
  const event = Route.useLoaderData();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Basic Info");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
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
    mapEmbedUrl: "",
    speakerSubtitle: "",
    whyAttendEnabled: true,
  });

  // Speakers State
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [draggedSpeakerId, setDraggedSpeakerId] = useState<string | null>(null);
  const [dragOverSpeakerId, setDragOverSpeakerId] = useState<string | null>(null);
  const [speakerForm, setSpeakerForm] = useState({
    name: "",
    title: "",
    company: "",
    bio: "",
    photo: "",
    linkedin: "",
    twitter: "",
    instagram: "",
  });
  const [speakerUploading, setSpeakerUploading] = useState(false);
  const speakerFileRef = useRef<HTMLInputElement>(null);

  // Sponsor Packages State
  interface SponsorPkg { id: string; name: string; price: number; benefits: string[]; highlighted: boolean; }
  const [sponsorPackages, setSponsorPackages] = useState<SponsorPkg[]>([]);
  const [sponsorForm, setSponsorForm] = useState({ name: "", price: "", benefit: "", benefits: [] as string[] });

  // Agenda State
  const [agenda, setAgenda] = useState<{ id: string; time: string; title: string; speaker: string; description: string }[]>([]);
  const [agendaForm, setAgendaForm] = useState({ time: "", title: "", speaker: "", description: "" });
  
  // Why Attend State
  const [whyAttendItems, setWhyAttendItems] = useState<{ id: string; title: string; description: string }[]>([]);
  const [whyAttendForm, setWhyAttendForm] = useState({ title: "", description: "" });

  // Sponsor Logos State
  const [sponsorLogos, setSponsorLogos] = useState<string[]>([]);
  const sponsorLogoRef = useRef<HTMLInputElement>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  // Load event data into state
  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || "",
        slug: event.slug || "",
        summary: event.summary || "",
        category: event.category || "",
        type: (event.type as any) || "physical",
        status: (event.status as any) || "draft",
        date: event.date ? event.date.substring(0, 10) : "",
        time: event.time || "",
        endTime: event.endTime || "",
        venue: event.venue || "",
        address: event.address || "",
        city: event.city || "",
        country: event.country || "Nigeria",
        description: event.description || "",
        objectives: event.objectives?.length ? [...event.objectives] : [""],
        topics: event.topics?.length ? [...event.topics] : [""],
        targetAudience: event.targetAudience || "",
        bannerImage: event.bannerImage || "",
        registrationOpen: event.registrationOpen !== false,
        registrationDeadline: event.registrationDeadline ? event.registrationDeadline.substring(0, 10) : "",
        capacity: event.capacity ? String(event.capacity) : "",
        sponsorshipEnabled: event.sponsorshipEnabled === true,
        mapEmbedUrl: event.mapEmbedUrl || "",
        speakerSubtitle: event.speakerSubtitle || "",
        whyAttendEnabled: event.whyAttendEnabled !== false,
      });
      setSpeakers((event.speakers as any) || []);
      setSponsorPackages((event.sponsorPackages as any) || []);
      setAgenda((event.agenda as any) || []);
      setWhyAttendItems((event.whyAttendItems as any) || []);
      setSponsorLogos((event.sponsorLogos as any) || []);
    }
  }, [event]);

  const set = (field: string, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const addItem = (field: "objectives" | "topics") =>
    setForm((f) => ({ ...f, [field]: [...f[field], ""] }));

  const updateItem = (field: "objectives" | "topics", i: number, val: string) =>
    setForm((f) => ({ ...f, [field]: f[field].map((v, idx) => (idx === i ? val : v)) }));

  const removeItem = (field: "objectives" | "topics", i: number) =>
    setForm((f) => ({ ...f, [field]: f[field].filter((_, idx) => idx !== i) }));

  // Image Upload helper — uses chunk-based base64 to avoid stack overflow on large files
  const uploadFile = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);
    const result = await uploadEventImage({
      data: {
        fileBase64: base64,
        fileName: file.name,
        mimeType: file.type,
      },
    });
    return result.url;
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      set("bannerImage", url);
      toast.success("Banner image uploaded successfully!");
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSpeakerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSpeakerUploading(true);
    try {
      const url = await uploadFile(file);
      setSpeakerForm((prev) => ({ ...prev, photo: url }));
      toast.success("Speaker photo uploaded!");
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setSpeakerUploading(false);
    }
  };

  const addSpeaker = () => {
    if (!speakerForm.name.trim() || !speakerForm.title.trim()) {
      return toast.error("Speaker name and title are required.");
    }
    const newSpeaker: Speaker = {
      id: `spk_${Math.random().toString(36).substring(2, 9)}`,
      name: speakerForm.name,
      title: speakerForm.title,
      company: speakerForm.company,
      bio: speakerForm.bio,
      photo: speakerForm.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(speakerForm.name)}&background=1a1a1a&color=fff&size=200`,
      linkedin: speakerForm.linkedin || undefined,
      twitter: speakerForm.twitter || undefined,
      instagram: speakerForm.instagram || undefined,
    };
    setSpeakers((prev) => [...prev, newSpeaker]);
    setSpeakerForm({
      name: "",
      title: "",
      company: "",
      bio: "",
      photo: "",
      linkedin: "",
      twitter: "",
      instagram: "",
    });
    toast.success("Speaker added!");
  };

  const removeSpeaker = (id: string) => {
    setSpeakers((prev) => prev.filter((s) => s.id !== id));
  };

  const editSpeaker = (spk: Speaker) => {
    if (speakerForm.name.trim() || speakerForm.title.trim()) {
      return toast.error("Please add your current speaker to the list before editing another.");
    }
    setSpeakerForm({
      name: spk.name,
      title: spk.title,
      company: spk.company,
      bio: spk.bio,
      photo: spk.photo,
      linkedin: spk.linkedin || "",
      twitter: spk.twitter || "",
      instagram: spk.instagram || "",
    });
    removeSpeaker(spk.id);
    document.getElementById("add-speaker-form")?.scrollIntoView({ behavior: "smooth" });
  };

  // Agenda Functions
  const addAgendaItem = () => {
    if (!agendaForm.time.trim() || !agendaForm.title.trim()) {
      return toast.error("Agenda time and title are required.");
    }
    setAgenda((prev) => [
      ...prev,
      {
        id: `agenda_${Math.random().toString(36).substring(2, 9)}`,
        ...agendaForm,
      },
    ]);
    setAgendaForm({ time: "", title: "", speaker: "", description: "" });
    toast.success("Agenda item added!");
  };

  const removeAgendaItem = (id: string) => {
    setAgenda((prev) => prev.filter((a) => a.id !== id));
  };

  // Why Attend Functions
  const addWhyAttendItem = () => {
    if (!whyAttendForm.title.trim() || !whyAttendForm.description.trim()) {
      return toast.error("Title and description are required.");
    }
    setWhyAttendItems((prev) => [
      ...prev,
      {
        id: `wa_${Math.random().toString(36).substring(2, 9)}`,
        ...whyAttendForm,
      },
    ]);
    setWhyAttendForm({ title: "", description: "" });
    toast.success("Reason added!");
  };

  const removeWhyAttendItem = (id: string) => {
    setWhyAttendItems((prev) => prev.filter((w) => w.id !== id));
  };

  // Sponsor Logos Functions
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const url = await uploadFile(file);
      setSponsorLogos((prev) => [...prev, url]);
      toast.success("Sponsor logo uploaded!");
    } catch (err: any) {
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setLogoUploading(false);
    }
  };

  const removeSponsorLogo = (index: number) => {
    setSponsorLogos((prev) => prev.filter((_, i) => i !== index));
  };

  // Sponsor Packages Functions
  const addSponsorBenefit = () => {
    if (!sponsorForm.benefit.trim()) return;
    setSponsorForm((p) => ({ ...p, benefits: [...p.benefits, p.benefit.trim()], benefit: "" }));
  };
  const removeSponsorBenefit = (i: number) => {
    setSponsorForm((p) => ({ ...p, benefits: p.benefits.filter((_, idx) => idx !== i) }));
  };
  const addSponsorPackage = () => {
    if (!sponsorForm.name.trim() || !sponsorForm.price) return toast.error("Package name and price are required.");
    const pkg: SponsorPkg = {
      id: `sp_${Math.random().toString(36).substring(2, 9)}`,
      name: sponsorForm.name.trim(),
      price: parseInt(sponsorForm.price, 10) || 0,
      benefits: sponsorForm.benefits,
      highlighted: sponsorPackages.length === 0,
    };
    setSponsorPackages((prev) => [...prev, pkg]);
    setSponsorForm({ name: "", price: "", benefit: "", benefits: [] });
    toast.success("Sponsor package added!");
  };
  const removeSponsorPackage = (id: string) => {
    setSponsorPackages((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async (statusOverride?: "draft" | "published") => {
    const status = statusOverride || form.status;
    const isDraft = status === "draft";

    if (speakerForm.name.trim() || speakerForm.title.trim()) {
      setTab("Speakers");
      return toast.error("You have an unsaved speaker. Please click '+ Add Speaker to List' before saving.");
    }

    // Drafts only require a title so you can save partial progress
    if (!form.title.trim()) return toast.error("Event title is required.");

    // Full validation only runs when publishing
    if (!isDraft) {
      if (!form.slug.trim()) return toast.error("Event slug is required.");
      if (!form.summary.trim()) return toast.error("Event summary is required.");
      if (!form.category) return toast.error("Please select a category.");
      if (!form.date) return toast.error("Please select a date.");
      if (!form.time) return toast.error("Please enter a start time.");
      if (!form.venue.trim()) return toast.error("Please specify a venue.");
      if (!form.city.trim()) return toast.error("Please specify a city.");
      if (!form.bannerImage) return toast.error("Please upload or specify a banner image.");
    }

    setSaving(true);
    try {
      const payload = {
        id: event.id,
        title: form.title,
        slug: form.slug,
        summary: form.summary,
        category: form.category,
        type: form.type,
        status: status as "draft" | "published" | "upcoming" | "ongoing" | "completed" | "cancelled" | "archived",
        date: form.date,
        time: form.time,
        endTime: form.endTime || undefined,
        venue: form.venue,
        address: form.address,
        city: form.city,
        country: form.country,
        description: form.description || form.summary,
        objectives: form.objectives.filter(Boolean),
        topics: form.topics.filter(Boolean),
        targetAudience: form.targetAudience || undefined,
        bannerImage: form.bannerImage,
        registrationOpen: form.registrationOpen,
        registrationDeadline: form.registrationDeadline || undefined,
        capacity: form.capacity ? parseInt(form.capacity, 10) : undefined,
        sponsorshipEnabled: form.sponsorshipEnabled,
        mapEmbedUrl: form.mapEmbedUrl || undefined,
        speakerSubtitle: form.speakerSubtitle || undefined,
        whyAttendEnabled: form.whyAttendEnabled,
        whyAttendItems: whyAttendItems,
        sponsorLogos: sponsorLogos,
        agenda: agenda,
        speakers: speakers,
        sponsorPackages: sponsorPackages.map((p) => ({
          id: p.id, name: p.name, price: p.price, currency: "NGN",
          benefits: p.benefits, highlighted: p.highlighted,
        })),
        featured: event.featured || false,
        seo: {
          title: form.title,
          description: form.summary,
        },
      };

      await updateEvent({ data: payload });
      toast.success(isDraft ? "Draft saved successfully." : "Event updated successfully.");
      navigate({ to: "/admin/events" });
    } catch (err: any) {
      toast.error(`Failed to update event: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-dark">Edit Event</h1>
          <p className="text-muted-foreground text-sm mt-0.5 max-w-sm truncate">{event.title}</p>
        </div>
        <button
          onClick={() => handleSubmit()}
          disabled={saving}
          className="ml-auto inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:scale-105"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Changes
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
                set(
                  "slug",
                  e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "")
                );
              }}
              placeholder="e.g. Future of AI & Networking 2026"
              className={inputCls}
            />
          </FormField>

          <FormField label="URL Slug" required>
            <input
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="future-of-ai-networking-2026"
              className={inputCls}
            />
          </FormField>

          <FormField label="Summary" required>
            <textarea
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              rows={3}
              placeholder="A one-paragraph description shown on the events listing page."
              className={textareaCls}
            />
          </FormField>

          <div className="grid md:grid-cols-3 gap-4">
            <FormField label="Category" required>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={inputCls}
              >
                <option value="">Select category</option>
                {["Technology", "Workshop", "Networking", "Exhibition", "Business", "Photography", "Masterclass"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Event Type" required>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className={inputCls}
              >
                <option value="physical">🏛 In-Person</option>
                <option value="virtual">💻 Virtual</option>
                <option value="hybrid">🌐 Hybrid</option>
              </select>
            </FormField>

            <FormField label="Status">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className={inputCls}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="archived">Archived</option>
              </select>
            </FormField>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <FormField label="Date" required>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className={inputCls}
              />
            </FormField>
            <FormField label="Start Time" required>
              <input
                type="time"
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
                className={inputCls}
              />
            </FormField>
            <FormField label="End Time">
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => set("endTime", e.target.value)}
                className={inputCls}
              />
            </FormField>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Venue Name" required>
              <input
                value={form.venue}
                onChange={(e) => set("venue", e.target.value)}
                placeholder="Eko Hotel & Suites"
                className={inputCls}
              />
            </FormField>
            <FormField label="Street Address">
              <input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Plot 1415, Adetokunbo Ademola Street"
                className={inputCls}
              />
            </FormField>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="City" required>
              <input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Lagos"
                className={inputCls}
              />
            </FormField>
            <FormField label="Country">
              <input
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                className={inputCls}
              />
            </FormField>
          </div>

          <FormField label="Google Maps Embed URL (Optional)">
            <input
              value={form.mapEmbedUrl}
              onChange={(e) => set("mapEmbedUrl", e.target.value)}
              placeholder="e.g. https://www.google.com/maps/embed?pb=..."
              className={inputCls}
            />
          </FormField>
        </div>
      )}

      {/* ── DETAILS ── */}
      {tab === "Details" && (
        <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
          <FormField label="Full Description" required>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={8}
              placeholder="Full event description…"
              className={textareaCls}
            />
          </FormField>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-dark">Event Objectives</label>
              <button
                type="button"
                onClick={() => addItem("objectives")}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus size={12} /> Add Objective
              </button>
            </div>
            <div className="space-y-2">
              {form.objectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-2">
                  <GripVertical size={15} className="text-muted-foreground shrink-0" />
                  <input
                    value={obj}
                    onChange={(e) => updateItem("objectives", i, e.target.value)}
                    placeholder={`Objective ${i + 1}`}
                    className={`${inputCls} flex-1`}
                  />
                  {form.objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem("objectives", i)}
                      className="text-muted-foreground hover:text-red-500 p-1"
                    >
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
              <button
                type="button"
                onClick={() => addItem("topics")}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus size={12} /> Add Topic
              </button>
            </div>
            <div className="space-y-2">
              {form.topics.map((topic, i) => (
                <div key={i} className="flex items-center gap-2">
                  <GripVertical size={15} className="text-muted-foreground shrink-0" />
                  <input
                    value={topic}
                    onChange={(e) => updateItem("topics", i, e.target.value)}
                    placeholder={`Topic ${i + 1}`}
                    className={`${inputCls} flex-1`}
                  />
                  {form.topics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem("topics", i)}
                      className="text-muted-foreground hover:text-red-500 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <FormField label="Target Audience">
            <textarea
              value={form.targetAudience}
              onChange={(e) => set("targetAudience", e.target.value)}
              rows={3}
              placeholder="Who should attend this event? (e.g. photographers, corporate brands, tech enthusiasts)"
              className={textareaCls}
            />
          </FormField>
        </div>
      )}

      {/* ── SPEAKERS ── */}
      {tab === "Speakers" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border p-6" id="add-speaker-form">
            <h3 className="font-semibold text-dark mb-4">Add Event Speaker</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField label="Speaker Name" required>
                <input
                  value={speakerForm.name}
                  onChange={(e) => setSpeakerForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Kola Alabi"
                  className={inputCls}
                />
              </FormField>
              <FormField label="Title / Position" required>
                <input
                  value={speakerForm.title}
                  onChange={(e) => setSpeakerForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Chief Creative Director"
                  className={inputCls}
                />
              </FormField>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <FormField label="Company" required>
                <input
                  value={speakerForm.company}
                  onChange={(e) => setSpeakerForm((prev) => ({ ...prev, company: e.target.value }))}
                  placeholder="e.g. Gaspo Studios"
                  className={inputCls}
                />
              </FormField>
              <FormField label="Photo Upload">
                <div className="flex gap-3 items-center">
                  <input
                    type="file"
                    ref={speakerFileRef}
                    accept="image/*"
                    onChange={handleSpeakerPhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => speakerFileRef.current?.click()}
                    disabled={speakerUploading}
                    className="bg-muted hover:bg-muted/80 text-dark rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 border border-border transition-colors disabled:opacity-50"
                  >
                    {speakerUploading ? (
                      <Loader2 size={13} className="animate-spin text-primary" />
                    ) : (
                      <Upload size={13} />
                    )}
                    Upload Photo
                  </button>
                  {speakerForm.photo ? (
                    <img
                      src={speakerForm.photo}
                      alt="Speaker avatar"
                      className="w-10 h-10 object-cover rounded-full border border-border bg-muted"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">No image uploaded</span>
                  )}
                </div>
              </FormField>
            </div>

            <div className="mt-3">
              <FormField label="Brief Bio">
                <textarea
                  value={speakerForm.bio}
                  onChange={(e) => setSpeakerForm((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={2}
                  placeholder="A short description of the speaker's background."
                  className={textareaCls}
                />
              </FormField>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-3">
              <FormField label="LinkedIn URL">
                <input
                  value={speakerForm.linkedin}
                  onChange={(e) => setSpeakerForm((prev) => ({ ...prev, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/username"
                  className={inputCls}
                />
              </FormField>
              <FormField label="Twitter/X URL">
                <input
                  value={speakerForm.twitter}
                  onChange={(e) => setSpeakerForm((prev) => ({ ...prev, twitter: e.target.value }))}
                  placeholder="https://twitter.com/username"
                  className={inputCls}
                />
              </FormField>
              <FormField label="Instagram URL">
                <input
                  value={speakerForm.instagram}
                  onChange={(e) => setSpeakerForm((prev) => ({ ...prev, instagram: e.target.value }))}
                  placeholder="https://instagram.com/username"
                  className={inputCls}
                />
              </FormField>
            </div>

            <button
              type="button"
              onClick={addSpeaker}
              className="mt-5 bg-dark hover:bg-dark/80 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Add Speaker to List
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            <h3 className="font-semibold text-dark mb-4 flex items-center gap-2">
              <Users size={16} className="text-primary" />
              Speakers Added ({speakers.length})
            </h3>
            {speakers.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-xl">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">No speakers added yet. Add a speaker using the form above.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {speakers.map((spk) => (
                  <div
                    key={spk.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedSpeakerId(spk.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverSpeakerId(spk.id);
                    }}
                    onDragLeave={() => setDragOverSpeakerId(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedSpeakerId && draggedSpeakerId !== spk.id) {
                        setSpeakers((prev) => {
                          const oldIdx = prev.findIndex((s) => s.id === draggedSpeakerId);
                          const newIdx = prev.findIndex((s) => s.id === spk.id);
                          if (oldIdx < 0 || newIdx < 0) return prev;
                          const newArr = [...prev];
                          const [removed] = newArr.splice(oldIdx, 1);
                          newArr.splice(newIdx, 0, removed);
                          return newArr;
                        });
                      }
                      setDraggedSpeakerId(null);
                      setDragOverSpeakerId(null);
                    }}
                    onDragEnd={() => {
                      setDraggedSpeakerId(null);
                      setDragOverSpeakerId(null);
                    }}
                    className={`flex gap-3 p-3.5 border border-border bg-muted/10 rounded-xl relative group cursor-move transition-all ${
                      draggedSpeakerId === spk.id ? "opacity-50 border-dashed" : ""
                    } ${dragOverSpeakerId === spk.id ? "border-primary bg-primary/5 scale-[1.02] shadow-sm" : ""}`}
                  >
                    <img
                      src={spk.photo}
                      alt={spk.name}
                      className="w-14 h-14 object-cover rounded-xl border border-border bg-muted shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-bold text-dark text-sm truncate">{spk.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{spk.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{spk.company}</p>
                    </div>
                    <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => editSpeaker(spk)}
                        className="text-muted-foreground hover:text-primary p-1.5 rounded-lg hover:bg-muted bg-white border border-border shadow-sm"
                        title="Edit Speaker"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSpeaker(spk.id)}
                        className="text-muted-foreground hover:text-red-500 p-1.5 rounded-lg hover:bg-muted bg-white border border-border shadow-sm"
                        title="Remove Speaker"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MEDIA ── */}
      {tab === "Media" && (
        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <FormField label="Upload Event Banner Image" required>
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                Upload Image
              </button>
              <span className="text-xs text-muted-foreground">
                Image will be optimized and converted to WebP format automatically.
              </span>
            </div>
          </FormField>

          <FormField label="Or Paste Direct Banner URL">
            <input
              value={form.bannerImage}
              onChange={(e) => set("bannerImage", e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className={inputCls}
            />
          </FormField>

          {form.bannerImage && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-dark">Banner Preview:</p>
              <img
                src={form.bannerImage}
                alt="Banner preview"
                className="w-full h-56 object-cover rounded-xl border border-border bg-muted"
              />
            </div>
          )}
        </div>
      )}

      {/* ── AGENDA ── */}
      {tab === "Agenda" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border p-6" id="add-agenda-form">
            <h3 className="font-semibold text-dark mb-4">Add Agenda Item</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <FormField label="Time (e.g. 09:30 AM)">
                <input value={agendaForm.time} onChange={(e) => setAgendaForm((p) => ({ ...p, time: e.target.value }))} className={inputCls} />
              </FormField>
              <FormField label="Title (e.g. Registration)">
                <input value={agendaForm.title} onChange={(e) => setAgendaForm((p) => ({ ...p, title: e.target.value }))} className={inputCls} />
              </FormField>
              <FormField label="Speaker (Optional)">
                <input value={agendaForm.speaker} onChange={(e) => setAgendaForm((p) => ({ ...p, speaker: e.target.value }))} className={inputCls} />
              </FormField>
              <FormField label="Description (Optional)">
                <input value={agendaForm.description} onChange={(e) => setAgendaForm((p) => ({ ...p, description: e.target.value }))} className={inputCls} />
              </FormField>
            </div>
            <div className="flex justify-end">
              <button onClick={addAgendaItem} className="bg-primary hover:bg-primary-hover text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-all">
                + Add Item
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {agenda.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-border">
                <p className="text-muted-foreground text-sm">No agenda items added yet.</p>
              </div>
            ) : (
              agenda.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-border p-4 flex justify-between items-center group">
                  <div>
                    <h4 className="font-bold text-dark text-sm">{item.time} - {item.title}</h4>
                    {item.speaker && <p className="text-xs text-primary mt-1">{item.speaker}</p>}
                    {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                  </div>
                  <button onClick={() => removeAgendaItem(item.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── WHY ATTEND ── */}
      {tab === "Why Attend" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-border">
            <div>
              <p className="font-semibold text-dark text-sm">Enable "Why Attend" Section</p>
              <p className="text-xs text-muted-foreground mt-0.5">Show this section on the event page</p>
            </div>
            <button
              type="button"
              onClick={() => set("whyAttendEnabled", !form.whyAttendEnabled)}
              className={`w-12 h-6 rounded-full transition-all ${form.whyAttendEnabled ? "bg-primary" : "bg-muted-foreground/30"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.whyAttendEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          {form.whyAttendEnabled && (
            <>
              <div className="bg-white rounded-2xl border border-border p-6">
                <h3 className="font-semibold text-dark mb-4">Add Reason</h3>
                <div className="grid gap-4 mb-4">
                  <FormField label="Title (e.g. Network with Leaders)">
                    <input value={whyAttendForm.title} onChange={(e) => setWhyAttendForm((p) => ({ ...p, title: e.target.value }))} className={inputCls} />
                  </FormField>
                  <FormField label="Description">
                    <textarea rows={2} value={whyAttendForm.description} onChange={(e) => setWhyAttendForm((p) => ({ ...p, description: e.target.value }))} className={textareaCls} />
                  </FormField>
                </div>
                <div className="flex justify-end">
                  <button onClick={addWhyAttendItem} className="bg-primary hover:bg-primary-hover text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-all">
                    + Add Reason
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {whyAttendItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border border-border p-5 relative group">
                    <h4 className="font-bold text-dark mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <button onClick={() => removeWhyAttendItem(item.id)} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── SETTINGS ── */}
      {tab === "Settings" && (
        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
            <div>
              <p className="font-semibold text-dark text-sm">Featured Event</p>
              <p className="text-xs text-muted-foreground mt-0.5">Show as the main hero event on the upcoming events page</p>
            </div>
            <button
              type="button"
              onClick={() => set("featured", !form.featured)}
              className={`w-12 h-6 rounded-full transition-all ${form.featured ? "bg-primary" : "bg-muted-foreground/30"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.featured ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
            <div>
              <p className="font-semibold text-dark text-sm">Registration Open</p>
              <p className="text-xs text-muted-foreground mt-0.5">Allow attendees to register for this event</p>
            </div>
            <button
              type="button"
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
              type="button"
              onClick={() => set("sponsorshipEnabled", !form.sponsorshipEnabled)}
              className={`w-12 h-6 rounded-full transition-all ${form.sponsorshipEnabled ? "bg-primary" : "bg-muted-foreground/30"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.sponsorshipEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Registration Deadline">
              <input
                type="date"
                value={form.registrationDeadline}
                onChange={(e) => set("registrationDeadline", e.target.value)}
                className={inputCls}
              />
            </FormField>
            <FormField label="Capacity (leave blank for unlimited)">
              <input
                type="number"
                value={form.capacity}
                onChange={(e) => set("capacity", e.target.value)}
                placeholder="e.g. 500"
                className={inputCls}
              />
            </FormField>
          </div>

          <FormField label="Speaker Subtitle (Optional text below 'Keynote Speakers')">
            <input
              value={form.speakerSubtitle}
              onChange={(e) => set("speakerSubtitle", e.target.value)}
              placeholder="e.g. Meet the industry leaders shaping the Future of AI."
              className={inputCls}
            />
          </FormField>

          {/* Sponsor Logos */}
          <div className="border-t border-border pt-5 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-dark text-sm">Sponsor & Partner Logos</h4>
              <div>
                <input type="file" accept="image/*" className="hidden" ref={sponsorLogoRef} onChange={handleLogoUpload} />
                <button
                  type="button"
                  onClick={() => sponsorLogoRef.current?.click()}
                  disabled={logoUploading}
                  className="bg-muted hover:bg-muted/80 text-dark rounded-xl px-4 py-2 text-xs font-semibold transition-all"
                >
                  {logoUploading ? "Uploading..." : "Upload Logo"}
                </button>
              </div>
            </div>
            {sponsorLogos.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-3">
                {sponsorLogos.map((url, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-lg bg-muted border border-border p-2 flex items-center justify-center group">
                    <img src={url} alt="Sponsor" className="max-w-full max-h-full object-contain" />
                    <button
                      onClick={() => removeSponsorLogo(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sponsor Packages */}
          {form.sponsorshipEnabled && (
            <div className="border-t border-border pt-5 space-y-4">
              <h4 className="font-semibold text-dark text-sm flex items-center gap-2">
                💰 Sponsor Packages ({sponsorPackages.length})
              </h4>
              <div className="grid md:grid-cols-3 gap-3">
                <input value={sponsorForm.name} onChange={(e) => setSponsorForm((p) => ({ ...p, name: e.target.value }))} placeholder="Package name (e.g. Gold)" className={inputCls} />
                <input value={sponsorForm.price} onChange={(e) => setSponsorForm((p) => ({ ...p, price: e.target.value }))} type="number" placeholder="Price in NGN" className={inputCls} />
                <button type="button" onClick={addSponsorPackage} className="bg-primary hover:bg-primary-hover text-white rounded-xl px-4 py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-1">
                  <Plus size={14} /> Add Package
                </button>
              </div>
              <div className="flex gap-2">
                <input value={sponsorForm.benefit} onChange={(e) => setSponsorForm((p) => ({ ...p, benefit: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSponsorBenefit())} placeholder="Add benefit (e.g. Logo on banner)" className={`${inputCls} flex-1`} />
                <button type="button" onClick={addSponsorBenefit} className="bg-muted hover:bg-muted/80 text-dark rounded-xl px-3 py-2 text-xs font-semibold border border-border">+</button>
              </div>
              {sponsorForm.benefits.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {sponsorForm.benefits.map((b, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full">
                      {b}
                      <button type="button" onClick={() => removeSponsorBenefit(i)} className="hover:text-red-500 ml-0.5">&times;</button>
                    </span>
                  ))}
                </div>
              )}
              
              <div className="space-y-2 mt-4">
                {sponsorPackages.map((pkg) => (
                  <div key={pkg.id} className="p-3 border border-border rounded-xl flex items-center justify-between group gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-dark truncate">{pkg.name} — ₦{pkg.price.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground truncate">{pkg.benefits.join(", ")}</p>
                    </div>
                    <button onClick={() => removeSponsorPackage(pkg.id)} className="w-8 h-8 shrink-0 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Link to="/admin/events" className="text-sm text-muted-foreground hover:text-dark flex items-center gap-1">
          <ChevronLeft size={14} /> Back to Events
        </Link>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit()}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all hover:scale-105 flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
