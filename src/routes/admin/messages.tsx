import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAdmin } from "../admin";
import {
  Mail, MailOpen, Trash2, Search, Calendar, Phone,
  User, MessageSquare, ChevronRight, Inbox, MailWarning, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchContactMessages,
  markMessageRead,
  deleteContactMessage
} from "../../lib/actions/contact";

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessagesPage,
});

function AdminMessagesPage() {
  const { role } = useAdmin();
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "read">("all");
  const [loading, setLoading] = useState(true);

  // Load messages
  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await fetchContactMessages({
        data: {
          filter: filterTab,
          search: searchQuery || undefined
        }
      });
      setMessages(data);
      // Auto-select the first message if none is selected
      if (data.length > 0 && !selectedMessage) {
        setSelectedMessage(data[0]);
      }
    } catch (err: any) {
      toast.error(`Error loading messages: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [filterTab, searchQuery]);

  // Mark message as read
  const handleSelectMessage = async (msg: any) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      try {
        await markMessageRead({
          data: { id: msg.id, read: true }
        });
        // Update local state
        setMessages(prev =>
          prev.map(m => (m.id === msg.id ? { ...m, read: true } : m))
        );
        setSelectedMessage(prev => (prev && prev.id === msg.id ? { ...prev, read: true } : prev));
      } catch (err: any) {
        console.error("Failed to mark message read:", err);
      }
    }
  };

  // Toggle unread state
  const handleToggleUnread = async (e: React.MouseEvent, msgId: string, currentRead: boolean) => {
    e.stopPropagation();
    try {
      await markMessageRead({
        data: { id: msgId, read: !currentRead }
      });
      toast.success(currentRead ? "Marked as unread" : "Marked as read");
      setMessages(prev =>
        prev.map(m => (m.id === msgId ? { ...m, read: !currentRead } : m))
      );
      if (selectedMessage && selectedMessage.id === msgId) {
        setSelectedMessage(prev => ({ ...prev, read: !currentRead }));
      }
    } catch (err: any) {
      toast.error(`Failed to change message state: ${err.message}`);
    }
  };

  // Delete message
  const handleDeleteMessage = async (e: React.MouseEvent, msgId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this message permanently?")) return;

    try {
      await deleteContactMessage({ data: { id: msgId } });
      toast.success("Message deleted successfully.");
      setMessages(prev => prev.filter(m => m.id !== msgId));
      if (selectedMessage && selectedMessage.id === msgId) {
        setSelectedMessage(null);
      }
    } catch (err: any) {
      toast.error(`Failed to delete message: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-dark">Inbox Messages</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Read and manage inquiries sent through the contact form.</p>
        </div>
      </div>

      <div className="flex-1 flex bg-white rounded-2xl border border-border shadow-sm overflow-hidden min-h-0">
        {/* LEFT COLUMN: INBOX LIST */}
        <div className="w-[380px] border-r border-border flex flex-col min-h-0 bg-slate-50/50">
          {/* Filters & Search */}
          <div className="p-4 space-y-3 shrink-0 bg-white border-b border-border">
            <div className="relative">
              <Search size={15} className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search inbox..."
                className="w-full bg-slate-50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:border-primary outline-none"
              />
            </div>

            <div className="flex bg-slate-100 rounded-xl p-1 text-xs font-semibold">
              {(["all", "unread", "read"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                    filterTab === tab ? "bg-white text-dark shadow-sm" : "text-slate-500 hover:text-dark"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* List scroll panel */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm font-medium">
                <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block mr-2 align-middle" />
                Loading Inbox...
              </div>
            ) : messages.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Inbox size={28} className="mx-auto text-slate-300" />
                <p className="text-sm font-medium">Inbox is empty</p>
                <p className="text-xs text-slate-400">No contact messages match your filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {messages.map((msg) => {
                  const isSelected = selectedMessage?.id === msg.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg)}
                      className={`p-4 text-left cursor-pointer transition-all flex items-start gap-3 relative border-l-4 ${
                        isSelected
                          ? "bg-white border-l-primary"
                          : "hover:bg-slate-50/80 border-l-transparent"
                      } ${!msg.read ? "bg-primary/5 font-semibold" : ""}`}
                    >
                      <div className="mt-0.5 text-slate-400 shrink-0">
                        {msg.read ? <MailOpen size={16} className="text-slate-400" /> : <Mail size={16} className="text-primary" />}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate ${!msg.read ? "text-dark font-bold" : "text-slate-700 font-medium"}`}>
                            {msg.name}
                          </p>
                          <span className="text-slate-400 text-[10px] whitespace-nowrap">
                            {new Date(msg.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-dark font-medium truncate">{msg.subject || "(No Subject)"}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{msg.message}</p>
                      </div>

                      {/* Small action panel in hover */}
                      <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleToggleUnread(e, msg.id, msg.read)}
                          className="w-6 h-6 rounded bg-white hover:bg-slate-100 border border-border flex items-center justify-center text-slate-500 hover:text-dark shadow-sm transition-all"
                          title={msg.read ? "Mark as unread" : "Mark as read"}
                        >
                          {msg.read ? <Mail size={12} /> : <MailOpen size={12} />}
                        </button>
                        <button
                          onClick={(e) => handleDeleteMessage(e, msg.id)}
                          className="w-6 h-6 rounded bg-white hover:bg-red-50 border border-border flex items-center justify-center text-slate-500 hover:text-red-600 shadow-sm transition-all"
                          title="Delete message"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL READER PANEL */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          {selectedMessage ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Card Header details */}
              <div className="p-6 border-b border-border space-y-4 shrink-0 bg-slate-50/30">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-dark">{selectedMessage.subject || "(No Subject)"}</h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><User size={13} /> {selectedMessage.name}</span>
                      <span className="flex items-center gap-1"><Mail size={13} /> {selectedMessage.email}</span>
                      {selectedMessage.phone && (
                        <span className="flex items-center gap-1"><Phone size={13} /> {selectedMessage.phone}</span>
                      )}
                      <span className="flex items-center gap-1"><Calendar size={13} /> {new Date(selectedMessage.submittedAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <a
                    href={`mailto:${selectedMessage.email}?subject=RE: ${encodeURIComponent(selectedMessage.subject || "")}`}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl px-4 py-2 text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md shadow-primary/20"
                  >
                    Reply <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Message content viewer */}
              <div className="flex-1 overflow-y-auto p-6 min-h-0 space-y-6">
                <div className="bg-slate-50 border border-border/80 rounded-2xl p-6 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed shadow-inner">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <MailOpen size={36} className="text-slate-300" />
              <p className="text-sm font-semibold">No message selected</p>
              <p className="text-xs">Click on any message in the inbox to view full details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
