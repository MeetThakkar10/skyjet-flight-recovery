import { useEffect, useRef, useState, useCallback, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";
import { getChatHistory, sendChatMessage } from "@/api/chat";
import { ApiRequestError } from "@/api/client";
import type { ChatMessage } from "@/types";

export function ChatWidget({ bookingId, open, onOpenChange }: { bookingId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] flex-col gap-3">
        <DialogHeader>
          <DialogTitle>SkyJet Assistant</DialogTitle>
          <DialogDescription>Ask about your flight, rebooking, refunds, or anything else.</DialogDescription>
        </DialogHeader>

        <div ref={scrollRef} className="flex min-h-40 flex-1 flex-col gap-2 overflow-y-auto rounded-md border bg-muted/30 p-3">
          {loading ? (
            <LoadingSpinner label="Loading conversation..." />
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Say hello to get started.</p>
          ) : (
            messages.map((m) => (
              <div
                key={m._id}
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
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

        {error && <p className="text-sm text-destructive">{error}</p>}

        <form onSubmit={handleSend} className="flex gap-2">
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
      </DialogContent>
    </Dialog>
  );
}
