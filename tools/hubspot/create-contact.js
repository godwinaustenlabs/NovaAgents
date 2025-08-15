import { withNASValidation } from "../../shared/withNASValidation.js";
import { getHubSpotClient } from "./API.js";

async function createContactLogic(input) {
  const clientAPI = input.context.client_api_key;
  const hubspot = getHubSpotClient(clientAPI);

  const { input_text } = input.payload; // e.g., JSON string with contact details
  const contact = JSON.parse(input_text); 

  const apiResponse = await hubspot.createContact(contact);

  return {
    status: "success",
    agent_id: input.agent_id || "hubspot-create-contact",
    response: { hubspot: apiResponse },
    logs: { tokens_used: 0, execution_time_ms: 10 },
  };
}

export const createContact = withNASValidation(createContactLogic);