import { useEffect, useRef, useState } from "react";
import { Send, X, FileText, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME_MSG =
  "Welcome to Kaps Spares, someone will get in touch with you shortly. Additionally, please fill out this form with your Contact number, Email Address, and your name.";

interface Props {
  onOpenForm: () => void;
}

export function ChatAssistant({ onOpenForm }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");
  const [leadForm, setLeadForm] = useState({ name: "", email: "", contactNumber: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, showLeadForm, submitting, submitted]);

  function sendInitialMessage(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || showLeadForm) return;

    setMessages([
      { role: "user", content: text },
      { role: "assistant", content: WELCOME_MSG },
    ]);
    setInitialMessage(text);
    setInput("");
    setShowLeadForm(true);
  }

  async function submitLeadForm(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || submitted) return;

    const name = leadForm.name.trim();
    const email = leadForm.email.trim();
    const contactNumber = leadForm.contactNumber.trim();

    if (!name || !email || !contactNumber) {
      setFormError("Please fill in all fields.");
      return;
    }

    setFormError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, contactNumber, initialMessage }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || "Request failed");

      setSubmitted(true);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Thank you! Your details have been submitted. Our team will be in touch shortly.",
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {!open && (
        <div className="chat-fab-pulse">
          <span aria-hidden className="chat-fab-pulse__aura" />
          <span aria-hidden className="chat-fab-pulse__aura chat-fab-pulse__aura--2" />
          <span aria-hidden className="chat-fab-pulse__ring" />
          <button
            type="button"
            aria-label="Open KAPS contact chat"
            onClick={() => setOpen(true)}
            className="chat-fab-pulse__trigger"
          >
            <img src="/logo.png" alt="" />
          </button>
        </div>
      )}

      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 flex w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl transition-all",
          open ? "h-[600px] max-h-[85vh] opacity-100" : "pointer-events-none h-0 opacity-0",
        )}
      >
        <div className="flex items-center justify-between gradient-brand px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-wide">KAPS Assistant</p>
              <p className="text-xs text-white/70">Spares That Drive You</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded p-1 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted text-black",
              )}
            >
              {m.content}
            </div>
          ))}

          {showLeadForm && !submitted && (
            <form onSubmit={submitLeadForm} className="max-w-[95%] space-y-3 rounded-2xl border bg-muted/50 p-3">
              <div className="space-y-1">
                <Label htmlFor="chat-name" className="text-black">
                  Name
                </Label>
                <Input
                  id="chat-name"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  placeholder="Your name"
                  className="text-black placeholder:text-black/50"
                  disabled={submitting}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="chat-email" className="text-black">
                  Email
                </Label>
                <Input
                  id="chat-email"
                  type="email"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  placeholder="you@example.com"
                  className="text-black placeholder:text-black/50"
                  disabled={submitting}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="chat-contact" className="text-black">
                  Contact Number
                </Label>
                <Input
                  id="chat-contact"
                  type="tel"
                  value={leadForm.contactNumber}
                  onChange={(e) => setLeadForm({ ...leadForm, contactNumber: e.target.value })}
                  placeholder="+260 ..."
                  className="text-black placeholder:text-black/50"
                  disabled={submitting}
                  required
                />
              </div>
              {formError && <p className="text-xs text-destructive">{formError}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit"}
              </Button>
            </form>
          )}
        </div>

        <div className="border-t bg-muted/40 px-4 py-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              setOpen(false);
              onOpenForm();
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            Submit a Formal Request
          </Button>
        </div>

        {!showLeadForm && (
          <form onSubmit={sendInitialMessage} className="flex gap-2 border-t bg-card p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell us how we can help…"
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" size="icon" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </>
  );
}
