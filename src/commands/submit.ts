import { defineCommand } from "citty";
import pc from "picocolors";
import { requireAuth } from "../lib/config.js";
import * as api from "../lib/api.js";

export const submitCommand = defineCommand({
  meta: { name: "submit", description: "Submit your challenge solution" },
  args: {
    slug: { type: "positional", description: "Challenge slug", required: true },
    url: { type: "string", description: "Deployment URL" },
    image: { type: "string", description: "Path to screenshot image" },
  },
  async run({ args }) {
    try {
      requireAuth();
    } catch (e) {
      console.error(pc.red((e as Error).message));
      process.exitCode = 1;
      return;
    }

    if (!args.url && !args.image) {
      console.error(pc.red("Provide either --url or --image."));
      console.log(`  codante submit ${args.slug} --url https://my-deploy.com`);
      console.log(`  codante submit ${args.slug} --image ./screenshot.png`);
      process.exitCode = 1;
      return;
    }

    try {
      if (args.url) {
        console.log(`Submitting ${pc.bold(args.slug)} with URL: ${args.url}`);
        await api.submitChallenge(args.slug, args.url);
      } else if (args.image) {
        // Validate file exists
        const { access } = await import("node:fs/promises");
        try {
          await access(args.image);
        } catch {
          console.error(pc.red(`File not found: ${args.image}`));
          process.exitCode = 1;
          return;
        }

        console.log(`Submitting ${pc.bold(args.slug)} with image: ${args.image}`);
        await api.submitWithoutDeploy(args.slug, args.image);
      }

      console.log(pc.green("Submitted successfully!"));
      console.log(
        pc.dim(`View at: https://codante.io/mini-projetos/${args.slug}/submissoes`)
      );
    } catch (e) {
      console.error(pc.red(`Submission failed: ${(e as Error).message}`));
      process.exitCode = 1;
    }
  },
});
