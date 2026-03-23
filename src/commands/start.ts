import { defineCommand } from "citty";
import pc from "picocolors";
import { requireAuth } from "../lib/config.js";
import * as api from "../lib/api.js";
import { forkRepo, parseRepoName } from "../lib/github.js";
import { cloneRepo } from "../lib/git.js";

export const startCommand = defineCommand({
  meta: { name: "start", description: "Join, fork, and clone a challenge" },
  args: {
    slug: { type: "positional", description: "Challenge slug", required: true },
    "no-fork": { type: "boolean", description: "Skip forking the repository", default: false },
    "no-clone": { type: "boolean", description: "Skip cloning the repository", default: false },
    dir: { type: "string", description: "Directory to clone into" },
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
      // 1. Get challenge details
      const challenge = await api.getChallenge(args.slug);
      console.log(`Starting ${pc.bold(challenge.name)}...`);

      // 2. Join challenge
      console.log("  Joining challenge...");
      await api.joinChallenge(args.slug);
      console.log(pc.green("  Joined!"));

      // 3. Fork repo
      if (!args["no-fork"] && challenge.repository_name) {
        // If repository_name has no owner, assume codante-io org
        const repoRef = challenge.repository_name.includes("/")
          ? challenge.repository_name
          : `codante-io/${challenge.repository_name}`;
        const parsed = parseRepoName(repoRef);
        if (parsed) {
          let cloneUrl = `https://github.com/${parsed.owner}/${parsed.repo}.git`;

          // Try to fork
          console.log(`  Forking ${parsed.owner}/${parsed.repo}...`);
          try {
            const fork = await forkRepo(`${parsed.owner}/${parsed.repo}`);
            console.log(pc.green(`  Forked to ${fork.full_name}`));
            cloneUrl = fork.clone_url;

            // Verify fork on Codante backend
            console.log("  Verifying fork...");
            await api.verifyFork(args.slug);
            console.log(pc.green("  Fork verified!"));
          } catch (e) {
            console.log(pc.yellow(`  Fork skipped: ${(e as Error).message}`));
            console.log(pc.dim(`  Cloning original repo instead.`));
          }

          // Clone (fork or original)
          if (!args["no-clone"]) {
            const gitInstalled = await (await import("../lib/git.js")).isGitInstalled();
            if (!gitInstalled) {
              console.log(pc.yellow("  Git is not installed. Skipping clone."));
              console.log(pc.dim(`  Install git and run: git clone ${cloneUrl}`));
            } else {
              console.log("  Cloning...");
              const dir = await cloneRepo(cloneUrl, args.dir);
              console.log(pc.green(`  Cloned to ./${dir}`));
            }
          }
        } else {
          console.log(pc.yellow("  No valid repository URL found."));
        }
      }

      console.log(pc.green("\nReady! Happy coding!"));
    } catch (e) {
      console.error(pc.red(`Failed: ${(e as Error).message}`));
      process.exitCode = 1;
    }
  },
});
