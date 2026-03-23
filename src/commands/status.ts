import { defineCommand } from "citty";
import pc from "picocolors";
import { requireAuth } from "../lib/config.js";
import * as api from "../lib/api.js";
import { formatStatus } from "../lib/format.js";

export const statusCommand = defineCommand({
  meta: { name: "status", description: "Show your challenge status" },
  args: {
    slug: { type: "positional", description: "Challenge slug", required: true },
    json: { type: "boolean", description: "Output as JSON", default: false },
    "verify-fork": { type: "boolean", description: "Check if fork exists on GitHub", default: false },
  },
  async run({ args }) {
    try {
      requireAuth();
    } catch (e) {
      console.error(pc.red((e as Error).message));
      process.exitCode = 1;
      return;
    }

    try {
      // Verify fork if requested
      if (args["verify-fork"]) {
        const forked = await api.verifyFork(args.slug);
        if (forked) {
          console.log(pc.green("Fork verified!"));
        } else {
          console.log(pc.yellow("Fork not found."));
        }
      }

      const status = await api.getStatus(args.slug);

      if (args.json) {
        console.log(JSON.stringify(status, null, 2));
        return;
      }

      console.log(formatStatus(status));
    } catch (e) {
      console.error(pc.red(`Failed to get status: ${(e as Error).message}`));
      process.exitCode = 1;
    }
  },
});
