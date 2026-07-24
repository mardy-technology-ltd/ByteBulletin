"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle, X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendNewsletterBroadcastAction } from "@/actions/newsletter.actions";

interface BroadcastModalProps {
  totalSubscribers: number;
}

export function BroadcastModal({ totalSubscribers }: BroadcastModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!subject.trim() || !message.trim()) {
      setFeedback({ type: "error", text: "Please enter both subject and broadcast message content." });
      return;
    }

    setIsSending(true);
    try {
      const res = await sendNewsletterBroadcastAction(subject, message);
      if (res.success) {
        setFeedback({ type: "success", text: res.message || "Broadcast sent successfully!" });
        setSubject("");
        setMessage("");
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to send broadcast." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.message || "An unexpected error occurred." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        disabled={totalSubscribers === 0}
        size="sm"
        className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-md shadow-violet-600/20 cursor-pointer"
      >
        <Send className="w-4 h-4 mr-1.5" />
        <span>Send Broadcast Email</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 space-y-6 text-foreground relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/20">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg leading-tight">Send Newsletter Broadcast</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Will send to <span className="font-bold text-primary">{totalSubscribers}</span> active subscriber(s)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Feedback Alert */}
            {feedback && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center space-x-2.5 font-medium ${
                  feedback.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500"
                    : "bg-red-500/10 border border-red-500/30 text-red-500"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            {/* Broadcast Form */}
            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="broadcast-subject" className="text-xs font-bold uppercase text-muted-foreground">
                  Email Subject Line
                </Label>
                <Input
                  id="broadcast-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. ByteBulletin Digest: Top 5 AI Innovations This Week"
                  required
                  className="rounded-xl bg-background border-border/80 text-sm h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="broadcast-message" className="text-xs font-bold uppercase text-muted-foreground">
                  Newsletter Content (Markdown / Text)
                </Label>
                <textarea
                  id="broadcast-message"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your email announcement or newsletter body here..."
                  required
                  className="w-full rounded-xl bg-background border border-border/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  disabled={isSending}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSending}
                  className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs px-5 cursor-pointer shadow-md shadow-violet-600/20"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Broadcast...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1.5" />
                      Send to All Subscribers
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
