"use client";

import { useChat } from "@ai-sdk/react";
import { ArrowUp, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const OPENERS = [
  "Am I eligible to join?",
  "What do I need to apply?",
  "How should I fund my account?",
  "What if I'm not approved right away?",
];

/**
 * Placeholder chat surface.
 *
 * This is deliberately plain — it exists so the backend can be exercised end to
 * end before the Figma/v0 design lands. When the designed component arrives,
 * replace the markup and keep the `useChat` wiring below: the transport, the
 * `parts` rendering and the status handling are what the API route expects.
 */
export function Assistant() {
  const { messages, sendMessage, status, error } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto flex w-full max-w-(--spacing-measure) flex-col gap-6">
          {messages.length === 0 ? (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <h1 className="font-display text-3xl leading-tight text-foreground">
                  Ask us anything
                </h1>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  Most people open an account once or twice in their life. If
                  something here is unclear, that&rsquo;s on us — ask.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {OPENERS.map((opener) => (
                  <button
                    key={opener}
                    type="button"
                    onClick={() => submit(opener)}
                    className="rounded-lg border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-secondary"
                  >
                    {opener}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col gap-1",
                  message.role === "user" ? "items-end" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-card-foreground border border-border",
                  )}
                >
                  {message.parts
                    .filter((part) => part.type === "text")
                    .map((part, index) => (
                      <span key={index}>{part.text}</span>
                    ))}
                </div>
              </div>
            ))
          )}

          {status === "submitted" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Thinking
            </div>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-[var(--ufcu-error-bg)] px-4 py-3 text-sm text-destructive"
            >
              Something went wrong. Try again, or call 512-467-8080.
            </p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-border bg-background px-6 py-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit(input);
          }}
          className="mx-auto flex w-full max-w-(--spacing-measure) items-end gap-2"
        >
          <label htmlFor="assistant-input" className="sr-only">
            Ask a question about opening an account
          </label>
          <input
            id="assistant-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask a question"
            autoComplete="off"
            className="h-[54px] flex-1 rounded-lg border border-input bg-card px-4 text-[15px] text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send"
            className="flex size-[54px] shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <ArrowUp className="size-5" aria-hidden />
          </button>
        </form>
        <p className="mx-auto mt-3 w-full max-w-(--spacing-measure) text-[13px] leading-snug text-muted-foreground">
          Don&rsquo;t share your SSN, account or card numbers here — those belong
          in the application form. This assistant can&rsquo;t see your accounts.
        </p>
      </div>
    </div>
  );
}
