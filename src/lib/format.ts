import Table from "cli-table3";
import pc from "picocolors";
import type { Challenge, ChallengeCard, ChallengeUser, User } from "../types.js";

export function formatChallengesTable(challenges: ChallengeCard[]): string {
  const table = new Table({
    head: [
      pc.bold("Name"),
      pc.bold("Difficulty"),
      pc.bold("Tech"),
      pc.bold("Users"),
    ],
    style: { head: [] },
  });

  for (const c of challenges) {
    table.push([
      c.name,
      formatDifficulty(c.difficulty),
      c.main_technology?.name || "-",
      String(c.enrolled_users_count),
    ]);
  }

  return table.toString();
}

export function formatChallengeDetail(challenge: Challenge): string {
  const lines = [
    `${pc.bold(challenge.name)}`,
    `${pc.dim("Slug:")} ${challenge.slug}`,
    `${pc.dim("Difficulty:")} ${formatDifficulty(challenge.difficulty)}`,
    `${pc.dim("Status:")} ${challenge.status}`,
    `${pc.dim("Tags:")} ${challenge.tags.map((t) => t.name).join(", ") || "-"}`,
    `${pc.dim("Enrolled:")} ${challenge.enrolled_users_count} users`,
    `${pc.dim("Repository:")} ${challenge.repository_name}`,
    `${pc.dim("Premium:")} ${challenge.is_premium ? "Yes" : "No"}`,
    "",
    challenge.short_description,
  ];
  return lines.join("\n");
}

export function formatStatus(status: ChallengeUser): string {
  const check = pc.green("\u2713");
  const cross = pc.red("\u2717");

  const lines = [
    `${pc.bold(status.challenge.name)}`,
    "",
    `  Joined:    ${check}`,
    `  Forked:    ${status.fork_url ? check : cross}${status.fork_url ? ` (${status.fork_url})` : ""}`,
    `  Submitted: ${status.submitted_at ? check : cross}${status.submission_url ? ` (${status.submission_url})` : ""}`,
    `  Completed: ${status.completed ? check : cross}`,
  ];
  return lines.join("\n");
}

export function formatUser(user: User): string {
  const lines = [
    `${pc.bold(user.name)}`,
    `${pc.dim("Email:")} ${user.email}`,
    `${pc.dim("GitHub:")} ${user.github_user || "-"}`,
    `${pc.dim("Pro:")} ${user.is_pro ? pc.green("Yes") : "No"}`,
  ];
  return lines.join("\n");
}

function formatDifficulty(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "1":
    case "newbie":
      return pc.green("Newbie");
    case "2":
    case "intermediate":
      return pc.yellow("Intermediate");
    case "3":
    case "advanced":
      return pc.red("Advanced");
    default:
      return difficulty;
  }
}
