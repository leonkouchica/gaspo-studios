import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Star,
  CheckCircle2,
  CalendarDays,
  MapPin,
  Wifi,
  Landmark,
  Loader2,
  ArrowRight,
  MessageSquareHeart,
  Sparkles,
  ShieldCheck,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { submitEventFeedback, type EventFeedbackInput } from "../../lib/actions/event-feedback";

interface EventBrief {
  id: string;
  slug: string;
  title: string;
  date: string;
  bannerImage?: string;
  city?: string;
  category?: string;
}

interface EventFeedbackFormProps {
  event: EventBrief;
  onSuccess?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Exceptional!",
};

function StarRating({
  value,
  onChange,
  label,
  required = true,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  required?: boolean;
}) {
  const [hoverVal, setHoverVal] = useState<number | null>(null);
  const active = hoverVal !== null ? hoverVal : value;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-white/90">
          {label} {required && <span className="text-primary">*</span>}
        </label>
        {active > 0 && (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
            {RATING_LABELS[active]}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= active;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverVal(star)}
              onMouseLeave={() => setHoverVal(null)}
              className="p-1 sm:p-2 rounded-xl transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-label={`Rate ${star} out of 5 stars`}
            >
              <Star
                size={28}
                className={`transition-colors duration-200 ${
                  filled
                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                    : "text-white/20 hover:text-white/40"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function EventFeedbackForm({ event, onSuccess }: EventFeedbackFormProps) {
  const [attendanceMode, setAttendanceMode] = useState<"in_person" | "virtual">("in_person");
  const [overallRating, setOverallRating] = useState<number>(0);
  const [contentRating, setContentRating] = useState<number>(0);
  const [organizationRating, setOrganizationRating] = useState<number>(0);
  const [venueRating, setVenueRating] = useState<number>(0);
  const [npsScore, setNpsScore] = useState<number | null>(null);

  const [bestAspect, setBestAspect] = useState("");
  const [improvementSuggestions, setImprovementSuggestions] = useState("");
  const [futureTopics, setFutureTopics] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (overallRating === 0) {
      toast.error("Please provide an overall experience rating.");
      return;
    }
    if (contentRating === 0) {
      toast.error("Please rate the keynote & masterclass content.");
      return;
    }
    if (organizationRating === 0) {
      toast.error("Please rate the event organization & coordination.");
      return;
    }
    if (venueRating === 0) {
      toast.error("Please rate the venue & facilities / streaming quality.");
      return;
    }
    if (npsScore === null) {
      toast.error("Please choose a recommendation score (0 to 10).");
      return;
    }
    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: EventFeedbackInput = {
        eventId: event.id,
        attendanceMode,
        overallRating,
        contentRating,
        organizationRating,
        venueRating,
        npsScore,
        bestAspect,
        improvementSuggestions,
        futureTopics,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
      };

      await submitEventFeedback({ data: payload });
      setSubmitted(true);
      toast.success("Thank you! Your feedback has been received.");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Feedback submission error:", err);
      toast.error(err.message || "Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-dark-secondary/80 border border-border-dark rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 size={42} />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
          <Sparkles size={12} /> Feedback Received
        </span>
        <h3 className="text-3xl font-bold text-white mb-3">Thank You for Your Voice!</h3>
        <p className="text-white/70 text-base leading-relaxed max-w-lg mx-auto">
          Your feedback for <strong className="text-white">{event.title}</strong> directly empowers
          our team to craft even more inspiring events, masterclasses, and creative experiences.
        </p>

        <div className="mt-8 pt-8 border-t border-border-dark flex flex-wrap justify-center gap-4">
          <Link
            to="/events/$eventId"
            params={{ eventId: event.slug }}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-full px-6 py-3 font-semibold text-sm transition-all"
          >
            ← Return to Event Page
          </Link>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-3 font-semibold text-sm transition-all shadow-lg shadow-primary/25"
          >
            Explore Upcoming Events <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-dark-secondary/80 border border-border-dark rounded-3xl p-6 sm:p-8 md:p-10 backdrop-blur-md shadow-2xl space-y-8 max-w-3xl mx-auto"
    >
      {/* Event Reference Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-border-dark">
        {event.bannerImage && (
          <img
            src={event.bannerImage}
            alt={event.title}
            className="w-full sm:w-24 h-24 object-cover rounded-2xl bg-muted shrink-0 border border-white/10"
          />
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {event.category && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                {event.category}
              </span>
            )}
            <span className="text-xs text-white/50 flex items-center gap-1">
              <CalendarDays size={12} className="text-primary" />
              {new Date(event.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            {event.city && (
              <span className="text-xs text-white/50 flex items-center gap-1">
                <MapPin size={12} className="text-primary" />
                {event.city}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">{event.title}</h2>
          <p className="text-white/60 text-xs sm:text-sm mt-1">
            Complete this brief 2-minute survey to help us elevate future sessions.
          </p>
        </div>
      </div>

      {/* ── QUESTION 1: Attendance Mode ── */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-white/90 block">
          1. How did you attend this event? <span className="text-primary">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAttendanceMode("in_person")}
            className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
              attendanceMode === "in_person"
                ? "bg-primary/20 border-primary text-white shadow-lg shadow-primary/20"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                attendanceMode === "in_person"
                  ? "bg-primary text-white"
                  : "bg-white/10 text-white/60"
              }`}
            >
              <Landmark size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm text-white">In-Person / Onsite</p>
              <p className="text-xs text-white/50">Attended physically at the venue</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAttendanceMode("virtual")}
            className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
              attendanceMode === "virtual"
                ? "bg-primary/20 border-primary text-white shadow-lg shadow-primary/20"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                attendanceMode === "virtual"
                  ? "bg-primary text-white"
                  : "bg-white/10 text-white/60"
              }`}
            >
              <Wifi size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm text-white">Virtually / Online</p>
              <p className="text-xs text-white/50">Joined via live stream / online platform</p>
            </div>
          </button>
        </div>
      </div>

      {/* ── QUESTION 2 to 5: Star Ratings ── */}
      <div className="grid sm:grid-cols-2 gap-6 pt-2">
        <StarRating
          value={overallRating}
          onChange={setOverallRating}
          label="2. Overall Event Experience"
        />

        <StarRating
          value={contentRating}
          onChange={setContentRating}
          label="3. Speakers & Content Quality"
        />

        <StarRating
          value={organizationRating}
          onChange={setOrganizationRating}
          label="4. Organization & Logistics"
        />

        <StarRating
          value={venueRating}
          onChange={setVenueRating}
          label={
            attendanceMode === "in_person"
              ? "5. Venue & Facilities"
              : "5. Online Stream & Tech Quality"
          }
        />
      </div>

      {/* ── QUESTION 6: Highlights ── */}
      <div className="space-y-2 pt-2">
        <label className="text-sm font-semibold text-white/90 block">
          6. What was the most valuable or memorable part of this event?
        </label>
        <textarea
          rows={3}
          value={bestAspect}
          onChange={(e) => setBestAspect(e.target.value)}
          placeholder="E.g., The live lighting masterclass, portfolio reviews, speaker Q&A..."
          className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-2xl p-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
        />
      </div>

      {/* ── QUESTION 7: Areas for Improvement ── */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-white/90 block">
          7. What could we have done better or what felt missing?
        </label>
        <textarea
          rows={3}
          value={improvementSuggestions}
          onChange={(e) => setImprovementSuggestions(e.target.value)}
          placeholder="E.g., More time for questions, clearer directions, longer networking sessions..."
          className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-2xl p-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
        />
      </div>

      {/* ── QUESTION 8: Future Topics ── */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-white/90 block">
          8. What topics, workshops, or speakers would you love to see next?
        </label>
        <textarea
          rows={2}
          value={futureTopics}
          onChange={(e) => setFutureTopics(e.target.value)}
          placeholder="E.g., Drone cinematography, advanced Lightroom workflows, commercial pitching..."
          className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-2xl p-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
        />
      </div>

      {/* ── QUESTION 9: Net Promoter Score (NPS) ── */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <label className="text-sm font-semibold text-white/90">
            9. How likely are you to recommend Gaspo Studios events to peers?{" "}
            <span className="text-primary">*</span>
          </label>
          <span className="text-xs text-white/50">Scale: 0 (Not at all) to 10 (Extremely)</span>
        </div>

        <div className="grid grid-cols-11 gap-1 sm:gap-1.5">
          {Array.from({ length: 11 }, (_, i) => i).map((score) => {
            const isSelected = npsScore === score;
            const isHigh = score >= 9;
            const isMid = score >= 7 && score <= 8;
            return (
              <button
                key={score}
                type="button"
                onClick={() => setNpsScore(score)}
                className={`py-3 rounded-xl font-bold text-xs sm:text-sm transition-all text-center focus:outline-none ${
                  isSelected
                    ? "bg-primary text-white scale-110 shadow-lg shadow-primary/40 ring-2 ring-primary"
                    : isHigh
                      ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                      : isMid
                        ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20"
                        : "bg-white/5 text-white/60 hover:bg-white/15 border border-white/10"
                }`}
              >
                {score}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between text-[11px] text-white/40 px-1">
          <span>0 - Not Likely</span>
          <span>5 - Neutral</span>
          <span>10 - Very Likely</span>
        </div>
      </div>

      {/* ── QUESTION 10: Attendee Details (Mandatory) ── */}
      <div className="pt-4 border-t border-border-dark space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldCheck size={16} className="text-primary" />
            10. Attendee Information <span className="text-primary">*</span>
          </h4>
          <p className="text-xs text-white/50 mt-0.5">
            Please provide your name and email address to verify and record your feedback.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/70 block mb-1 font-medium">
              Your Full Name <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Alex Johnson"
              className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-xs text-white/70 block mb-1 font-medium">
              Email Address <span className="text-primary">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary-hover text-white rounded-full py-4 font-bold text-base transition-all hover:scale-[1.01] shadow-lg shadow-primary/30 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Submitting Feedback…
            </>
          ) : (
            <>
              <Send size={18} />
              Submit Event Feedback
            </>
          )}
        </button>
      </div>
    </form>
  );
}
