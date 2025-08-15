import { withNASValidation } from "../../shared/withNASValidation.js";

/**
 * Lightbulb tool — just echoes back the payload for testing
 * @param {Object} input - NAS-compliant input object
 * @returns {Object} NAS-compliant output object
 */
async function lightbulbLogic(input) {
  return {
    status: "success",
    id: input.id,
    response: {
      idea: `💡 You said: ${input.payload.input_text}`
    },
    logs: {
      tokens_used: 0,
      execution_time_ms: 10
    }
  };
}

export const lightbulb = withNASValidation(lightbulbLogic);