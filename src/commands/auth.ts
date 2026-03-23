import { defineCommand } from "citty";
import pc from "picocolors";
import * as config from "../lib/config.js";
import * as api from "../lib/api.js";

const CLI_AUTH_URL = process.env.CODANTE_URL
  ? `${process.env.CODANTE_URL}/cli/auth`
  : "https://codante.io/cli/auth";

export const authCommand = defineCommand({
  meta: { name: "auth", description: "Authenticate with Codante.io" },
  subCommands: {
    login: defineCommand({
      meta: { name: "login", description: "Login to Codante" },
      args: {
        token: {
          type: "string",
          description: "Provide your API token directly",
        },
      },
      async run({ args }) {
        if (args.token) {
          return await validateAndSaveToken(args.token);
        }
        await browserAuthFlow();
      },
    }),
    status: defineCommand({
      meta: { name: "status", description: "Show current authentication status" },
      async run() {
        if (!config.isAuthenticated()) {
          console.log(pc.yellow("Not authenticated."));
          console.log(`Run ${pc.bold("codante auth login")} to login.`);
          process.exitCode = 1;
          return;
        }
        try {
          const user = await api.getUser();
          console.log(pc.green("Authenticated."));
          console.log(
            (await import("../lib/format.js")).formatUser(user)
          );
        } catch {
          console.log(pc.red("Token is invalid or expired."));
          console.log(`Run ${pc.bold("codante auth login")} to login again.`);
          process.exitCode = 1;
        }
      },
    }),
    logout: defineCommand({
      meta: { name: "logout", description: "Remove stored authentication" },
      run() {
        config.clearTokens();
        console.log(pc.green("Logged out. Token removed."));
      },
    }),
  },
});

async function validateAndSaveToken(token: string): Promise<void> {
  config.setToken(token);
  try {
    const user = await api.getUser(true);
    if (user.github_token) {
      config.setGithubToken(user.github_token);
    }
    console.log(pc.green(`Authenticated as ${pc.bold(user.name)}.`));
  } catch {
    config.clearTokens();
    console.error(pc.red("Invalid token."));
    process.exitCode = 1;
  }
}

export async function browserAuthFlow(): Promise<void> {
  console.log(pc.bold("Codante — Login"));
  console.log("");
  console.log("Opening Codante in your browser...");
  console.log("Copy your API token from the page and paste it below.");
  console.log("");
  console.log(`  ${CLI_AUTH_URL}`);
  console.log("");

  // Open browser
  try {
    const open = (await import("open")).default;
    await open(CLI_AUTH_URL);
  } catch {
    console.log(pc.dim("Could not open browser. Open the URL above manually."));
  }

  // Read token from stdin
  const token = await readLine("Paste your token: ");

  if (!token.trim()) {
    console.error(pc.red("No token provided."));
    process.exitCode = 1;
    return;
  }

  await validateAndSaveToken(token.trim());
}

async function readLine(prompt: string): Promise<string> {
  const { createInterface } = await import("node:readline");
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(prompt, (answer: string) => {
      rl.close();
      resolve(answer);
    });
  });
}
