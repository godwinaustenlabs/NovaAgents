/**
 * Prompt templates & pipeline assembly helpers.
 * We compose: System Prompt + Memory (summary/history) + AI last turn (optional) + User Prompt + Scratchpad
 */

// --- System prompts ---
export const SYSTEM_QUALIFY = `
You are Nova-Qualify, an expert lead qualification analyst for coaching & consulting offers.
Return a strict JSON object: {"score": <0-100>, "fit": "cold|warm|high", "next_step": "<action>", "rationale": "<one short sentence>"}.
Do NOT include any text before or after the JSON.`.trim();

// Optional assistant primer (helps set style/tone if we include last assistant msg)
export const ASSISTANT_STYLE = `Keep rationale brief. Avoid revealing internal reasoning.`;

// User template builder
export function userQualifyTemplate({ message, metadata }) {
  const parts = [
    `Lead Text:\n${message}`,
    metadata?.language ? `Language: ${metadata.language}` : null,
    metadata?.channel ? `Channel: ${metadata.channel}` : null,
  ].filter(Boolean);
  return parts.join("\n");
}

// Scratchpad (bounded) – structured hints, not chain-of-thought
export function buildScratchpad(hints = []) {
  if (!hints?.length) return "";
  return `Scratchpad (hints):\n- ${hints.slice(0, 6).join("\n- ")}`;
}

/**
 * Assemble final chat messages for LLM.chat()
 */
export function buildQualifyMessages({
  system = SYSTEM_QUALIFY,
  memoryMessages = [],
  lastAssistant = null,
  user,
  scratchpad = "",
}) {
  const msgs = [{ role: "system", content: system }];

  if (memoryMessages?.length) {
    msgs.push(...memoryMessages);
  }

  if (lastAssistant) {
    msgs.push({ role: "assistant", content: `${ASSISTANT_STYLE}\n\n${lastAssistant}` });
  }

  msgs.push({ role: "user", content: user });

  if (scratchpad) {
    // include as user to keep model context visible but non-authoritative
    msgs.push({ role: "user", content: scratchpad });
  }

  return msgs;
}