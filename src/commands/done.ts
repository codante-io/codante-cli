import { defineCommand } from "citty";
import pc from "picocolors";
import { requireAuth } from "../lib/config.js";
import * as api from "../lib/api.js";

export const doneCommand = defineCommand({
  meta: { name: "done", description: "Mark a challenge as completed" },
  args: {
    slug: { type: "positional", description: "Challenge slug", required: true },
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
      // Check current status first
      const status = await api.getStatus(args.slug);

      if (!status.submitted_at) {
        console.error(pc.red("You haven't submitted this challenge yet."));
        console.log(`Run ${pc.bold(`codante submit ${args.slug} --url <deploy-url>`)} first.`);
        process.exitCode = 1;
        return;
      }

      if (status.completed) {
        console.log(pc.yellow("This challenge is already marked as complete."));
        return;
      }

      await api.markComplete(args.slug);
      console.log(pc.green(`Challenge ${pc.bold(args.slug)} marked as complete!`));
      console.log("Congratulations on finishing the challenge!");
    } catch (e) {
      console.error(pc.red(`Failed: ${(e as Error).message}`));
      process.exitCode = 1;
    }
  },
});
