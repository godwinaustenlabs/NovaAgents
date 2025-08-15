// test-llm.js
import LLM from "./shared/llm.js";

const messages = [
  { role: "system", content: "You are a friendly assistant." },
  { role: "user", content: "Give me 3 creative marketing taglines for a coffee shop." }
];

const res = await LLM.chat(messages);
console.log(res);