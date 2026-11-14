# eve: Anthropic `web_search` + a local tool breaks thinking signatures

Minimal reproduction for an eve bug. It's a fresh `eve init` app, and the only change is [`agent/agent.ts`](agent/agent.ts): a direct Anthropic model with adaptive thinking. eve's default tools are unchanged.

## Reproduce

```bash
npm install
ANTHROPIC_API_KEY=sk-ant-... npm exec -- eve dev
```

Send:

> Search the web for one headline from today's tech news, then run Python in your sandbox to count the words in that headline. Keep it short.

In one response, Claude runs `web_search` (Anthropic's server-side `web_search_20250305`), thinks, then calls `bash`. Once `bash` returns, the next model call fails:

```
messages.3.content.0: Invalid `signature` in `thinking` block. The block is bound to a different conversation. … Content before this block was rewritten since it was created, first at `messages.1.content.0`.
```

## Why

After each step, `normalizeProviderToolHistory` (`packages/eve/src/harness/provider-tool-history.ts`, called from `harness/step/after-model.ts`) sees a provider-executed call in the same assistant message as a local call. It rewrites the call as `providerExecuted: false` and moves its result into a separate `tool` message.

On the next request, Anthropic gets a client `tool_use` plus a user `tool_result` instead of `server_tool_use` + `web_search_tool_result`. That changes the content before the signed thinking block, so Anthropic rejects the block.

Versions: eve 1.0.0-rc.17 (also 1.0.0-rc.13), ai 7.0.173, `claude-sonnet-5-5`.
