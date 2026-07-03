import { useEffect, useRef, useState, useCallback, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";
import { getChatHistory, sendChatMessage } from "@/api/chat";
import { ApiRequestError } from "@/api/client";
import type { ChatMessage } from "@/types";

export function ChatWidget({
  bookingId,
  open,
  onOpenChange,
}: {
  bookingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { messages } = await getChatHistory(bookingId);
      setMessages(messages);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not load chat history.");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (open) loadHistory();
  }, [open, loadHistory]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onOpenChange]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setSending(true);
    setError(null);
    setInput("");
    setMessages((prev) => [
      ...prev,
      { _id: `local-${Date.now()}`, bookingId, sender: "passenger", message: text, createdAt: new Date().toISOString() },
    ]);
    try {
      const { reply } = await sendChatMessage(bookingId, text);
      setMessages((prev) => [
        ...prev,
        { _id: `local-${Date.now()}-r`, bookingId, sender: "assistant", message: reply, createdAt: new Date().toISOString() },
      ]);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not send your message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Floating launcher — bottom-right on every device */}
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="size-5" /> : <Bot className="size-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="chat-overlay"
              className="fixed inset-0 z-40 bg-black/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => onOpenChange(false)}
            />
            <motion.div
              key="chat-panel"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="fixed inset-x-0 bottom-0 z-50 flex h-[80vh] max-h-[640px] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:inset-x-auto sm:bottom-24 sm:right-6 sm:h-[560px] sm:w-96 sm:rounded-2xl"
            >
              <div className="flex items-center gap-2.5 border-b border-border p-4">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                  <Bot className="size-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">SkyJet Assistant</p>
                  <p className="text-xs text-muted-foreground">Flight, rebooking, refunds — ask anything</p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close assistant"
                  className="rounded-lg p-1.5 text-muted-foreground opacity-70 transition-opacity hover:opacity-100"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div ref={scrollRef} className="flex flex-1 flex-col gap-2 overflow-y-auto bg-muted/30 p-3">
                {loading ? (
                  <LoadingSpinner label="Loading conversation..." />
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Say hello to get started.</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m._id}
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                        m.sender === "passenger"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "mr-auto bg-card text-card-foreground ring-1 ring-foreground/10"
                      )}
                    >
                      {m.message}
                    </div>
                  ))
                )}
                {sending && <p className="text-xs text-muted-foreground">Assistant is typing...</p>}
              </div>

              {error && <p className="px-3 pt-2 text-sm text-destructive">{error}</p>}

              <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={sending}
                  autoFocus
                />
                <Button type="submit" disabled={sending || !input.trim()}>
                  Send
                </Button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
