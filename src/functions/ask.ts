import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { CopilotClient, approveAll } from "@github/copilot-sdk";
import type { SessionConfig } from "@github/copilot-sdk";
import { DefaultAzureCredential } from "@azure/identity";

const client = new CopilotClient();

const instructions = `
    1. A robot may not injure a human being...
    2. A robot must obey orders given it by human beings...
    3. A robot must protect its own existence...
    
    Objective: Give me the TLDR in exactly 5 words.
`;

async function getSessionConfig(): Promise<SessionConfig> {
  const config: SessionConfig = {
    systemMessage: { content: instructions },
    onPermissionRequest: approveAll,
  };

  const baseUrl = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const model =
    process.env.AZURE_OPENAI_DEPLOYMENT_NAME ||
    process.env.AZURE_OPENAI_MODEL ||
    "gpt-5-mini";

  if (baseUrl) {
    config.model = model;
    const provider: NonNullable<SessionConfig["provider"]> = {
      type: "azure",
      baseUrl,
    };
    if (apiKey) {
      provider.apiKey = apiKey;
    } else {
      const credential = new DefaultAzureCredential();
      const tokenResponse = await credential.getToken(
        "https://cognitiveservices.azure.com/.default"
      );
      provider.bearerToken = tokenResponse.token;
    }
    config.provider = provider;
  }

  return config;
}

async function ask(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const prompt = (await req.text()) || "What are the laws?";
  context.log(`Prompt: ${prompt}`);

  const session = await client.createSession(await getSessionConfig());
  const reply = await session.sendAndWait({ prompt });
  const responseText = reply?.data?.content || "No response";
  await session.destroy();

  return { body: responseText, headers: { "Content-Type": "text/plain" } };
}

app.http("ask", {
  methods: ["POST"],
  authLevel: "function",
  handler: ask,
});
