import {
  validateNASInput,
  validateNASOutput,
} from '../../NovaSystems/utils/validateNAS.js';

/**
 * Wraps an agent's logic function with NAS input/output validation
 * @param {Function} agentLogic - async function that takes NAS input and returns NAS output
 * @returns {Function} - async function with validation before & after logic
 */
export function withNASValidation(agentLogic) {
  return async function (requestBody) {
    // Validate NAS Input
    const inCheck = validateNASInput(requestBody);
    if (!inCheck.valid) {
      return {
        status: 'error',
        agent_id: requestBody?.agent_id || 'unknown',
        error: {
          code: 'INVALID_INPUT',
          message: inCheck.errors,
        },
      };
    }

    // Run agent logic
    let output;
    try {
      output = await agentLogic(requestBody);
    } catch (err) {
      return {
        status: 'error',
        agent_id: requestBody?.agent_id || 'unknown',
        error: {
          code: 'AGENT_LOGIC_ERROR',
          message: err.message || 'Unknown error in agent logic',
        },
      };
    }

    // Validate NAS Output
    const outCheck = validateNASOutput(output);
    if (!outCheck.valid) {
      return {
        status: 'error',
        agent_id: output?.agent_id || requestBody?.agent_id || 'unknown',
        error: {
          code: 'INVALID_OUTPUT',
          message: outCheck.errors,
        },
      };
    }

    return output;
  };
}
