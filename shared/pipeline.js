import config from "./config.js";
import LLM from "./llm.js";
import { DynamicMemory } from "./memory.js";
import { buildQualifyMessages, userQualifyTemplate, buildScratchpad, SYSTEM_QUALIFY } from "./prompt.js";

/**
 * High-level pipeline to talk to LLM using templates + memory.
 * Returns parsed JSON-safe object with guardrails.
 */
export async function runQualifyPipeline({
  client_id,
  agent_id,
  input_text,
  metadata,
  memoryMode = "dynamic",            // "buffer" | "summary" | "dynamic"
  hints = [],
}) {
  const mem = new DynamicMemory();   // swap if needed
  const { messages: memMsgs } = await mem.buildContextMessages(client_id, agent_id);

  const user = userQualifyTemplate({ message: input_text, metadata });
  const scratchpad = buildScratchpad(hints).slice(0, config.memory.maxScratchpadTokens * config.llm.estCharsPerToken);

  const messages = buildQualifyMessages({
    system: SYSTEM_QUALIFY,
    memoryMessages: memMsgs,
    user,
    scratchpad,
  });

  const { text, tokensUsed } = await LLM.chat(messages, {
    temperature: config.llm.temperature,
    maxOutputTokens: config.llm.maxOutputTokens,
  });

  // Parse strict JSON result safely
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    // fallback: minimal safe default
    parsed = { score: 50, fit: "warm", next_step: "Ask clarifying question", rationale: "Fallback due to parse error." };
  }

  // persist current turn into memory (user + assistant result summary)
  await mem.saveAndMaybeSummarize(client_id, agent_id, { role: "user", content: input_text });
  await mem.saveAndMaybeSummarize(client_id, agent_id, {
    role: "assistant",
    content: `score=${parsed.score}; fit=${parsed.fit}; next=${parsed.next_step}; rationale=${parsed.rationale}`,
  });

  return { parsed, tokensUsed };
}