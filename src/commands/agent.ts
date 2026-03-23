import { defineCommand } from "citty";

const AGENT_INSTRUCTIONS = {
  tool: "codante",
  version: "0.1.0",
  description:
    "CLI for Codante.io — a Brazilian coding challenge platform where users build real frontend projects (cards, landing pages, full apps) and submit their deployed solutions.",

  commands: {
    "auth login --token <token>":
      "Authenticate with Codante API. Required before start/submit/status/done.",
    "auth status": "Check who is logged in.",
    "auth logout": "Clear stored credentials.",
    "challenges list --json":
      "List all challenges. Filters: --difficulty (newbie|intermediate|advanced), --tech <name>, --enrolled, --not-enrolled, --free",
    "challenges show <slug> --json": "Get challenge details including repo name and description.",
    "start <slug>":
      "Join + fork + clone a challenge repo. Flags: --no-fork, --no-clone, --dir <path>",
    "submit <slug> --url <url>": "Submit a deployed solution URL.",
    "submit <slug> --image <path>": "Submit a screenshot if no deploy available.",
    "status <slug> --json": "Check progress: joined, forked, submitted, completed.",
    "status <slug> --verify-fork": "Verify fork exists on GitHub.",
    "done <slug>": "Mark challenge as complete. Requires submission first.",
  },

  env_vars: {
    CODANTE_TOKEN: "API token. Skips 'auth login' if set.",
    CODANTE_API_URL: "Override API URL (default: https://api.codante.io/api). Use http://localhost:8000/api for local dev.",
    CODANTE_URL: "Override frontend URL (default: https://codante.io). Use http://localhost:3000 for local dev.",
    GITHUB_TOKEN: "GitHub token for forking. Auto-fetched from Codante account on login, or set manually.",
  },

  workflow: {
    description: "The typical challenge workflow is: browse → start → code → submit → done",
    steps: [
      "1. Browse: `codante challenges list --json` to find a challenge",
      "2. Start: `codante start <slug>` joins the challenge, forks the repo, and clones it locally",
      "3. Code: Build the solution in the cloned directory",
      "4. Deploy: Deploy to Vercel, Netlify, GitHub Pages, or any hosting",
      "5. Submit: `codante submit <slug> --url <deploy-url>` submits the solution",
      "6. Done: `codante done <slug>` marks the challenge as complete",
    ],
  },

  agent_guidelines: {
    description:
      "Guidelines for AI agents helping users with Codante challenges.",

    before_starting: [
      "Ask the user what experience level they are and what they want to learn.",
      "Ask: 'Do you want me to guide you step by step, or should I build it and explain what I did?'",
      "Use `codante challenges list --not-enrolled --free --json` to suggest challenges matching their interests.",
      "Show the challenge description with `codante challenges show <slug>` so the user knows what they're building.",
    ],

    guided_mode: [
      "Walk the user through the project step by step.",
      "Start by explaining the challenge goal and what technologies they'll use.",
      "Break the project into small, incremental tasks.",
      "Write code together — let the user make decisions about structure, naming, and approach.",
      "Explain WHY, not just WHAT. The user is here to learn.",
      "After each step, ask if they understood before moving on.",
      "Don't write the entire solution at once.",
    ],

    agentful_mode: [
      "Build the full solution autonomously.",
      "After completing, walk the user through what was built and why.",
      "Highlight interesting patterns, techniques, or decisions made.",
      "Offer to refactor or improve specific parts if the user wants to explore alternatives.",
      "Deploy and submit automatically if the user gives permission.",
    ],

    general_rules: [
      "Always use `codante start <slug>` to properly join and clone — don't just git clone directly.",
      "Always use `codante submit` to submit — this registers the submission on the platform.",
      "Always use `codante done` to complete — this awards points and enables certificate requests.",
      "Check `codante status <slug>` to see where the user is in the flow.",
      "Challenges are frontend projects. Most use HTML/CSS, TailwindCSS, React, or Next.js.",
      "The goal is a pixel-perfect or close implementation of the challenge design.",
      "Encourage the user to deploy their solution — even a simple GitHub Pages deploy counts.",
      "If the user is stuck, check the challenge description for hints about what's expected.",
      "After completing, suggest the user share their submission on social media (the platform has share buttons).",
    ],

    challenge_types: {
      newbie:
        "Simple UI components (cards, forms, landing pages). Focus on HTML/CSS fundamentals and responsive design.",
      intermediate:
        "Full features with state management, API calls, or complex interactions. React or Next.js projects.",
      advanced:
        "Complete applications with auth, databases, or complex architectures. Full-stack Next.js projects.",
      hackathon:
        "Time-limited creative challenges. Encourage creativity over perfection.",
    },
  },
};

export const agentCommand = defineCommand({
  meta: { name: "agent", description: "Output instructions for AI agents" },
  run() {
    console.log(JSON.stringify(AGENT_INSTRUCTIONS, null, 2));
  },
});
