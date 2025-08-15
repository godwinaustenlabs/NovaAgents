import { withNASValidation } from "../../shared/withNASValidation.js";
import { getHubSpotClient } from "./API.js";

async function updateContactLogic(input) {
  const clientAPI = input.context.client_api_key;
  const hubspot = getHubSpotClient(clientAPI);

  const { contactId, updates } = JSON.parse(input.payload.input_text);

  const apiResponse = await hubspot.updateContact(contactId, updates);

  return {
    status: "success",
    agent_id: input.agent_id || "hubspot-update-contact",
    response: { hubspot: apiResponse },
    logs: { tokens_used: 0, execution_time_ms: 10 },
  };
}

export const updateContact = withNASValidation(updateContactLogic);