import OpenAI from "openai"

import type { AiProvider } from "../../types"

export function createAiClient(
    provider: Pick<AiProvider, "baseUrl" | "apiKey">,
): OpenAI {
    return new OpenAI({
        baseURL: provider.baseUrl,
        apiKey: provider.apiKey || "dummy-key-for-local-models",
        dangerouslyAllowBrowser: true,
    })
}
