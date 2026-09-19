import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

import { SYSTEM_PROMPT } from "@/lib/system-prompt";

// Streaming needs a real runtime window; Vercel's Hobby ceiling is 60s.
export const maxDuration = 30;

/**
 * Model is env-configurable so it can be tuned in Vercel without a redeploy.
 * The default trades a little depth for the latency an in-flow assistant needs —
 * someone mid-application will not wait on a flagship model.
 */
const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";

const MAX_MESSAGES = 40;
const MAX_CHARS_PER_MESSAGE = 4_000;

function textLengthOf(message: UIMessage): number {
  return (message.parts ?? []).reduce(
    (total, part) => total + (part.type === "text" ? part.text.length : 0),
    0,
  );
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("[chat] OPENAI_API_KEY is not set");
    return Response.json(
      { error: "The assistant is not configured. Please call 512-467-8080." },
      { status: 500 },
    );
  }

  let messages: UIMessage[];
  try {
    ({ messages } = (await req.json()) as { messages: UIMessage[] });
  } catch {
    return Response.json({ error: "Malformed request body." }, { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "No messages provided." }, { status: 400 });
  }

  if (messages.some((message) => textLengthOf(message) > MAX_CHARS_PER_MESSAGE)) {
    return Response.json({ error: "That message is too long." }, { status: 413 });
  }

  // Keep only the tail of long conversations: bounds cost and latency, and the
  // system prompt carries everything that actually has to persist.
  const recent = messages.slice(-MAX_MESSAGES);

  const result = streamText({
    model: openai(MODEL),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(recent),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: (error) => {
        // Never surface provider errors to the applicant.
        console.error("[chat] stream error", error);
        return "Something went wrong on our end. Please try again, or call 512-467-8080.";
      },
    }),
  });
}
