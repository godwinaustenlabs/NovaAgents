import { withNASValidation } from "../../shared/withNASValidation.js";
import config from "../../shared/config.js";
import { runQualifyPipeline } from "../../shared/pipeline.js";

/**
 * NAS-compliant qualify agent using:
 * - Llama-3 chat with prompt pipeline (system+memory+user+scratchpad)
 * - Dynamic memory (buffer + auto-summary within token budget)
 */
async function qualifyLogic(input) {
  const { client_id, agent_id = "nova-qualify" } = input;
  const { input_text, metadata } = input.payload;

  const { parsed, tokensUsed } = await runQualifyPipeline({
    client_id,
    agent_id,
    input_text,
    metadata,
    memoryMode: "dynamic",
    hints: [
      "Score higher if user mentions pricing, timeline, or budget.",
      "Lower if purely informational with no buying intent.",
    ],
  });

  // Map score → fit if model didn't set it precisely
  const thr = config.qualify.thresholds;
  const fit =
    parsed.fit ||
    (parsed.score >= thr.high ? "high" : parsed.score >= thr.warm ? "warm" : "cold");

  return {
    status: "success",
    agent_id,
    response: {
      score: parsed.score,
      fit,
      next_step: parsed.next_step,
      rationale: parsed.rationale,
    },
    logs: {
      tokens_used: tokensUsed,
      execution_time_ms: 20,
    },
  };
}

export default withNASValidation(qualifyLogic);