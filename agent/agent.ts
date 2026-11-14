import { defineAgent } from "eve";
import { anthropic } from "eve/models/anthropic";

// A direct Anthropic model with adaptive thinking. eve's default tools stay
// on, so the model gets Anthropic's native `web_search` and `bash`.
export default defineAgent({
  model: anthropic("claude-sonnet-5-5"),
  modelOptions: {
    providerOptions: {
      anthropic: {
        thinking: { type: "adaptive", display: "summarized" },
      },
    },
  },
});
