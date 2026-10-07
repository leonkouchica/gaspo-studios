import { useState, useEffect, useCallback, useMemo } from "react";
import {
  MessageSquareHeart,
  Star,
  Copy,
  Download,
  ExternalLink,
  Search,
  RefreshCw,
  Landmark,
  Wifi,
  Trash2,
  CalendarDays,
  Users,
  Sparkles,
  TrendingUp,
  Award,
  Loader2,
  Check,
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import {
  fetchEventFeedback,
  deleteEventFeedback,
  type EventFeedbackItem,
  type EventFeedbackSummary,
} from "../../lib/actions/event-feedback";

interface EventBrief {
  id: string;
  slug: string;
  title: string;
  status: string;
  date: string;
}

interface EventFeedbackTabProps {
  allEvents: EventBrief[];
  initialEventId?: string;
}

export function EventFeedbackTab({ allEvents, initialEventId }: EventFeedbackTabProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId || "all");
  const [feedbackList, setFeedbackList] = useState<EventFeedbackItem[]>([]);
  const [summary, setSummary] = useState<EventFeedbackSummary>({
    totalResponses: 0,
    averageOverall: 0,
    averageContent: 0,
    averageOrganization: 0,
    averageVenue: 0,
    npsScore: 0,
    promotersPct: 0,
    passivesPct: 0,
    detractorsPct: 0,
    inPersonCount: 0,
    virtualCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  const currentEvent = useMemo(
    () => allEvents.find((e) => e.id === selectedEventId || e.slug === selectedEventId),
    [allEvents, selectedEventId],
  );

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchEventFeedback({
        data: { eventId: selectedEventId === "all" ? undefined : selectedEventId },
      });
      setFeedbackList(res.items);
      setSummary(res.summary);
    } catch (err: any) {
      console.error("Failed to load feedback:", err);
      toast.error(err.message || "Failed to load feedback.");
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  // Copy feedback link
  const getFeedbackUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.gaspostudios.com";
    if (currentEvent) {
      return `${origin}/events/${currentEvent.slug}/feedback`;
    }
    return `${origin}/events/feedback`;
  };

  const handleCopyLink = () => {
    const url = getFeedbackUrl();
    navigator.clipboard.writeText(url);
    toast.success("Feedback link copied to clipboard!");
  };

  // Delete single feedback
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback submission?")) return;
    setDeletingId(id);
    try {
      await deleteEventFeedback({ data: { id } });
      toast.success("Feedback deleted.");
      setFeedbackList((prev) => prev.filter((item) => item.id !== id));
      loadFeedback();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete feedback.");
    } finally {
      setDeletingId(null);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (feedbackList.length === 0) {
      toast.error("No feedback data to export.");
      return;
    }

    const exportRows = feedbackList.map((item, idx) => ({
      "#": idx + 1,
      "Event Title": item.eventTitle,
      "Respondent Name": item.fullName,
      "Respondent Email": item.email,
      "Attendance Mode": item.attendanceMode === "in_person" ? "In-Person" : "Virtual",
      "Overall Rating (1-5)": item.overallRating,
      "Content & Speakers (1-5)": item.contentRating,
      "Organization (1-5)": item.organizationRating,
      "Venue / Platform (1-5)": item.venueRating,
      "NPS Score (0-10)": item.npsScore,
      "Best Aspect / Highlights": item.bestAspect,
      "Improvement Suggestions": item.improvementSuggestions,
      "Future Topics Requested": item.futureTopics,
      "Submitted At": new Date(item.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Event Feedback");

    const filename = currentEvent
      ? `feedback-${currentEvent.slug}.xlsx`
      : `all-event-feedback-${new Date().toISOString().slice(0, 10)}.xlsx`;

    XLSX.writeFile(workbook, filename);
    toast.success(`Exported ${feedbackList.length} feedback entries to ${filename}`);
  };

  // Filtered entries
  const filteredList = useMemo(() => {
    return feedbackList.filter((item) => {
      const matchSearch =
        !search ||
        item.fullName.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.bestAspect.toLowerCase().includes(search.toLowerCase()) ||
        item.improvementSuggestions.toLowerCase().includes(search.toLowerCase()) ||
        item.futureTopics.toLowerCase().includes(search.toLowerCase());

      const matchMode = modeFilter === "all" || item.attendanceMode === modeFilter;
      const matchRating =
        ratingFilter === "all" || item.overallRating === parseInt(ratingFilter, 10);

      return matchSearch && matchMode && matchRating;
    });
  }, [feedbackList, search, modeFilter, ratingFilter]);

  return (
    <div className="space-y-6">
      {/* ── Top Bar: Event Selector & Actions ── */}
      <div className="bg-white rounded-2xl border border-border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-sm font-semibold text-dark whitespace-nowrap">Filter Event:</label>
          <div className="relative min-w-[260px]">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm bg-white focus:border-primary outline-none pr-8 font-medium text-dark cursor-pointer"
            >
              <option value="all">All Events ({allEvents.length})</option>
              {allEvents.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} {evt.status === "completed" ? "✓ Concluded" : ""}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={loadFeedback}
            disabled={loading}
            className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-dark transition-colors"
            title="Refresh Feedback"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-dark rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all border border-border"
          >
            <Copy size={13} className="text-primary" />
            Copy Feedback Link
          </button>

          {currentEvent && (
            <a
              href={`/events/${currentEvent.slug}/feedback`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-dark rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all border border-border"
            >
              <ExternalLink size={13} className="text-primary" />
              Open Form
            </a>
          )}

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={feedbackList.length === 0}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl px-4 py-2.5 text-xs font-semibold transition-all shadow-sm"
          >
            <Download size={13} />
            Export to Excel
          </button>
        </div>
      </div>

      {/* ── Summary Metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Responses */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Total Responses</span>
            <Users size={16} className="text-primary" />
          </div>
          <p className="text-3xl font-bold text-dark">{summary.totalResponses}</p>
          <p className="text-[11px] text-muted-foreground pt-1">
            <span className="font-semibold text-dark">{summary.inPersonCount}</span> In-Person ·{" "}
            <span className="font-semibold text-dark">{summary.virtualCount}</span> Virtual
          </p>
        </div>

        {/* Overall Satisfaction Rating */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Overall Experience</span>
            <Star size={16} className="text-amber-500 fill-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-3xl font-bold text-dark">{summary.averageOverall || "0.0"}</p>
            <span className="text-xs text-muted-foreground">/ 5.0</span>
          </div>
          <div className="flex items-center gap-0.5 text-amber-500 pt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={12}
                className={s <= Math.round(summary.averageOverall) ? "fill-amber-400" : "text-gray-300"}
              />
            ))}
          </div>
        </div>

        {/* Net Promoter Score (NPS) */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Net Promoter Score</span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p
            className={`text-3xl font-bold ${
              summary.npsScore >= 50
                ? "text-emerald-600"
                : summary.npsScore >= 0
                  ? "text-blue-600"
                  : "text-red-500"
            }`}
          >
            {summary.npsScore > 0 ? `+${summary.npsScore}` : summary.npsScore}
          </p>
          <p className="text-[11px] text-muted-foreground pt-1">
            <span className="text-emerald-600 font-semibold">{summary.promotersPct}%</span> Promoters ·{" "}
            <span className="text-blue-600 font-semibold">{summary.passivesPct}%</span> Passives ·{" "}
            <span className="text-red-500 font-semibold">{summary.detractorsPct}%</span> Detractors
          </p>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Aspect Averages</span>
            <Award size={16} className="text-primary" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Content & Speakers:</span>
              <span className="font-semibold text-dark">{summary.averageContent} / 5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Organization:</span>
              <span className="font-semibold text-dark">{summary.averageOrganization} / 5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Venue & Stream:</span>
              <span className="font-semibold text-dark">{summary.averageVenue} / 5</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white rounded-2xl border border-border p-4 flex flex-col sm:flex-row gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by respondent name, email, or comments…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm bg-white"
          />
        </div>

        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="rounded-xl border border-border px-3.5 py-2.5 text-sm bg-white focus:border-primary outline-none"
        >
          <option value="all">All Modes</option>
          <option value="in_person">In-Person</option>
          <option value="virtual">Virtual</option>
        </select>

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="rounded-xl border border-border px-3.5 py-2.5 text-sm bg-white focus:border-primary outline-none"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars Only</option>
          <option value="4">4 Stars Only</option>
          <option value="3">3 Stars Only</option>
          <option value="2">2 Stars Only</option>
          <option value="1">1 Star Only</option>
        </select>
      </div>

      {/* ── Submissions Feed ── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-border p-16 text-center text-muted-foreground">
          <Loader2 size={24} className="animate-spin mx-auto mb-3 text-primary" />
          <p className="text-sm">Loading event feedback…</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center space-y-3">
          <MessageSquareHeart size={36} className="mx-auto text-muted-foreground/40" />
          <h3 className="font-bold text-dark text-lg">No Feedback Found</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {feedbackList.length === 0
              ? "No attendees have submitted survey feedback for this event yet."
              : "No feedback entries match your search/filter criteria."}
          </p>

          <div className="pt-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-2.5 text-sm font-semibold transition-all shadow-md"
            >
              <Copy size={14} />
              Copy Feedback Link to Send to Attendees
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                    {item.fullName[0]?.toUpperCase() || "A"}
                  </div>
                  <div>
                    <h4 className="font-bold text-dark text-base leading-tight">
                      {item.fullName}
                      {item.email && (
                        <span className="text-muted-foreground font-normal text-xs ml-2">
                          ({item.email})
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>{item.eventTitle}</span>
                      <span>•</span>
                      <span>
                        {new Date(item.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Badges & Actions */}
                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      item.attendanceMode === "in_person"
                        ? "bg-blue-500/10 text-blue-700 border-blue-500/20"
                        : "bg-purple-500/10 text-purple-700 border-purple-500/20"
                    }`}
                  >
                    {item.attendanceMode === "in_person" ? <Landmark size={12} /> : <Wifi size={12} />}
                    {item.attendanceMode === "in_person" ? "In-Person" : "Virtual"}
                  </span>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      item.npsScore >= 9
                        ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                        : item.npsScore >= 7
                          ? "bg-blue-500/10 text-blue-700 border border-blue-500/20"
                          : "bg-red-500/10 text-red-700 border border-red-500/20"
                    }`}
                  >
                    NPS: {item.npsScore}/10
                  </span>

                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Feedback"
                  >
                    {deletingId === item.id ? (
                      <Loader2 size={15} className="animate-spin text-red-500" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              </div>

              {/* Ratings Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-muted/30 p-3 rounded-xl border border-border/60">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Overall:</span>
                  <div className="flex items-center gap-1 font-bold text-dark mt-0.5">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {item.overallRating} / 5
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Content & Speakers:</span>
                  <div className="flex items-center gap-1 font-bold text-dark mt-0.5">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {item.contentRating} / 5
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Organization:</span>
                  <div className="flex items-center gap-1 font-bold text-dark mt-0.5">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {item.organizationRating} / 5
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Venue / Tech:</span>
                  <div className="flex items-center gap-1 font-bold text-dark mt-0.5">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {item.venueRating} / 5
                  </div>
                </div>
              </div>

              {/* Qualitative Text Responses */}
              <div className="space-y-3 pt-1 text-sm">
                {item.bestAspect && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <Sparkles size={13} /> Most Valuable / Best Aspect:
                    </span>
                    <p className="text-dark bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-xs sm:text-sm leading-relaxed">
                      "{item.bestAspect}"
                    </p>
                  </div>
                )}

                {item.improvementSuggestions && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                      💡 Areas for Improvement:
                    </span>
                    <p className="text-dark bg-amber-50/60 border border-amber-100 rounded-xl p-3 text-xs sm:text-sm leading-relaxed">
                      "{item.improvementSuggestions}"
                    </p>
                  </div>
                )}

                {item.futureTopics && (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-primary flex items-center gap-1">
                      🎯 Future Topics & Speakers:
                    </span>
                    <p className="text-dark bg-primary/5 border border-primary/10 rounded-xl p-3 text-xs sm:text-sm leading-relaxed">
                      "{item.futureTopics}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
