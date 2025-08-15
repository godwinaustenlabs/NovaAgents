// shared/llm.js
import config from "./config.js";
import fetch from "node-fetch";

class ChatLLM {
  constructor() {
    this.cfg = config.llm;
    this.apiKey = config.auth.groq_api_key;
  }

  estimateTokens(str = "") {
    return Math.ceil((str || "").length / this.cfg.estCharsPerToken);
  }

  async chat(messages, options = {}) {
    const provider = this.cfg.provider;
    if (provider === "llama") {
      return this._callLlama(messages, options);
    }
    throw new Error(`Unsupported provider: ${provider}`);
  }

  async _callLlama(messages, options) {
    if (!this.apiKey) {
      throw new Error("Missing GROQ_API_KEY in environment variables");
    }

    const body = {
      model: this.cfg.model,
      temperature: options.temperature ?? this.cfg.temperature,
      max_tokens: options.maxOutputTokens ?? this.cfg.maxOutputTokens,
      messages
    };

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Groq API error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";

    return {
      text,
      tokensUsed: data.usage?.total_tokens ?? this.estimateTokens(JSON.stringify(body))
    };
  }
}

export default new ChatLLM();