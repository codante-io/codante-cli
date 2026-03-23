import { defineCommand } from "citty";
import pc from "picocolors";
import * as api from "../lib/api.js";
import { formatChallengesTable, formatChallengeDetail } from "../lib/format.js";

export const challengesCommand = defineCommand({
  meta: { name: "challenges", description: "Browse coding challenges" },
  subCommands: {
    list: defineCommand({
      meta: { name: "list", description: "List available challenges" },
      args: {
        json: { type: "boolean", description: "Output as JSON", default: false },
        difficulty: { type: "string", description: "Filter by difficulty (newbie, intermediate, advanced)" },
        tech: { type: "string", description: "Filter by technology" },
        enrolled: { type: "boolean", description: "Show only challenges you joined", default: false },
        "not-enrolled": { type: "boolean", description: "Show only challenges you haven't joined", default: false },
        free: { type: "boolean", description: "Show only free challenges", default: false },
      },
      async run({ args }) {
        try {
          let challenges = await api.getChallenges({
            difficulty: args.difficulty,
            tech: args.tech,
          });

          if (args.enrolled) {
            challenges = challenges.filter((c) => c.current_user_is_enrolled);
          }
          if (args["not-enrolled"]) {
            challenges = challenges.filter((c) => !c.current_user_is_enrolled);
          }
          if (args.free) {
            challenges = challenges.filter((c) => !c.is_premium);
          }

          if (args.json) {
            console.log(JSON.stringify(challenges, null, 2));
            return;
          }

          if (challenges.length === 0) {
            console.log(pc.yellow("No challenges found."));
            return;
          }

          console.log(formatChallengesTable(challenges));
          console.log(pc.dim(`\n${challenges.length} challenges found.`));
        } catch (e) {
          console.error(pc.red(`Failed to fetch challenges: ${(e as Error).message}`));
          process.exitCode = 1;
        }
      },
    }),
    show: defineCommand({
      meta: { name: "show", description: "Show challenge details" },
      args: {
        slug: { type: "positional", description: "Challenge slug", required: true },
        json: { type: "boolean", description: "Output as JSON", default: false },
      },
      async run({ args }) {
        try {
          const challenge = await api.getChallenge(args.slug);

          if (args.json) {
            console.log(JSON.stringify(challenge, null, 2));
            return;
          }

          console.log(formatChallengeDetail(challenge));
        } catch (e) {
          console.error(pc.red(`Failed to fetch challenge: ${(e as Error).message}`));
          process.exitCode = 1;
        }
      },
    }),
  },
});
