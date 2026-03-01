/**Console chat client for the Simple Agent function app.*/
import * as readline from "readline";

const BASE_URL = (process.env.AGENT_URL || "http://localhost:7071").replace(
  /\/$/,
  ""
);
const FUNCTION_KEY = process.env.FUNCTION_KEY || "";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("=== Simple Agent Chat ===");
console.log(`Endpoint: ${BASE_URL}/api/ask`);
console.log("Type 'exit' or 'quit' to end.\n");

function askQuestion(): void {
  rl.question("You: ", async (message) => {
    const trimmed = message.trim();
    if (!trimmed || ["exit", "quit"].includes(trimmed.toLowerCase())) {
      console.log("Goodbye!");
      rl.close();
      return;
    }

    let url = `${BASE_URL}/api/ask`;
    if (FUNCTION_KEY) {
      url += `?code=${FUNCTION_KEY}`;
    }

    try {
      const resp = await fetch(url, { method: "POST", body: trimmed });
      if (!resp.ok) throw new Error(`HTTP Error ${resp.status}: ${resp.statusText}`);
      const text = await resp.text();
      console.log(`\nAgent: ${text}\n`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`\nError: ${msg}\n`);
    }

    askQuestion();
  });
}

askQuestion();
