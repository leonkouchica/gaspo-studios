import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Users, Send, Trash2, Mailbox, UploadCloud } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import RichTextEditor from "../../components/RichTextEditor";
import {
  fetchSubscribers,
  deleteSubscriber,
  broadcastNewsletter,
  importSubscribers,
} from "../../lib/actions/newsletter";

export const Route = createFileRoute("/admin/newsletter")({
  component: AdminNewsletterPage,
});

function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"subscribers" | "broadcast">("subscribers");

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  // Broadcast State
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("<p>Hello!</p>");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const data = await fetchSubscribers();
      setSubscribers(data);
    } catch (err: any) {
      toast.error(`Error loading subscribers: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this subscriber?")) return;
    try {
      await deleteSubscriber({ data: { id } });
      toast.success("Subscriber removed.");
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    toast.info("Parsing file...");

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = event.target?.result;
          let textData = "";

          if (file.name.endsWith(".xlsx")) {
            const workbook = XLSX.read(data, { type: "binary" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            textData = XLSX.utils.sheet_to_txt(worksheet);
          } else {
            textData = data as string;
          }

          // Extract emails using regex
          const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
          const foundEmails = textData.match(emailRegex) || [];

          // Deduplicate and filter out invalid/empty strings just in case
          const uniqueEmails = Array.from(new Set(foundEmails.map((e) => e.toLowerCase())));

          if (uniqueEmails.length === 0) {
            toast.error("No valid emails found in the file.");
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
          }

          toast.info(`Found ${uniqueEmails.length} emails. Importing...`);

          const result = await importSubscribers({ data: { emails: uniqueEmails } });

          toast.success(`Successfully imported ${result.count} subscribers!`);
          await loadSubscribers();
        } catch (err: any) {
          toast.error(`Error processing file: ${err.message}`);
        } finally {
          setImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };

      if (file.name.endsWith(".xlsx")) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsText(file);
      }
    } catch (err: any) {
      toast.error(`Error reading file: ${err.message}`);
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error("Subject is required.");
      return;
    }
    if (!content.trim() || content === "<p></p>") {
      toast.error("Content is required.");
      return;
    }
    if (
      !confirm(`Are you sure you want to send this broadcast to ${subscribers.length} subscribers?`)
    )
      return;

    setSending(true);
    toast.info("Sending broadcast...");
    try {
      const result = await broadcastNewsletter({
        data: { subject, content },
      });
      toast.success(
        `Sent! Successfully delivered to ${result.successCount} subscribers. (${result.failCount} failed)`,
      );
      setSubject("");
      setContent("<p>Hello!</p>");
    } catch (err: any) {
      toast.error(`Broadcast failed: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Newsletters</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage subscribers and send broadcasts.
          </p>
        </div>
      </div>

      <div className="flex justify-between border-b border-border">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("subscribers")}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === "subscribers"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-dark"
            }`}
          >
            <Users size={18} />
            Subscribers ({subscribers.length})
          </button>
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === "broadcast"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-dark"
            }`}
          >
            <Send size={18} />
            Broadcast Email
          </button>
        </div>

        {activeTab === "subscribers" && (
          <div className="flex items-center py-1 pr-2">
            <input
              type="file"
              accept=".xlsx,.csv,.txt"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <UploadCloud size={16} />
              {importing ? "Importing..." : "Import Subscribers"}
            </button>
          </div>
        )}
      </div>

      {activeTab === "subscribers" && (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading subscribers...</div>
          ) : subscribers.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Mailbox size={24} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-dark">No subscribers yet</h3>
              <p className="text-muted-foreground mt-1">
                When people subscribe to your newsletter, they will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Subscribed At</th>
                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-dark">{sub.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(sub.subscribedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Remove subscriber"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "broadcast" && (
        <form
          onSubmit={handleBroadcast}
          className="bg-white rounded-2xl border border-border shadow-sm p-6 max-w-4xl space-y-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Email Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. New Blog Post: How we shot the latest commercial"
                className="w-full bg-slate-50 border border-border rounded-xl px-4 py-2 text-sm focus:border-primary outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Email Body</label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                uploadFolder="newsletter"
                showHtmlToggle={true}
              />
              <p className="text-xs text-muted-foreground mt-2">
                This email will be sent to all {subscribers.length} active subscribers. Images uploaded will be automatically converted to WebP.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              type="submit"
              disabled={sending || subscribers.length === 0}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                "Sending..."
              ) : (
                <>
                  <Send size={18} />
                  Send Broadcast to {subscribers.length} Subscribers
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
