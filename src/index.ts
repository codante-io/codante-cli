#!/usr/bin/env node

import { defineCommand, runMain } from "citty";
import { authCommand } from "./commands/auth.js";
import { challengesCommand } from "./commands/challenges.js";
import { startCommand } from "./commands/start.js";
import { submitCommand } from "./commands/submit.js";
import { statusCommand } from "./commands/status.js";
import { doneCommand } from "./commands/done.js";
import { agentCommand } from "./commands/agent.js";

const main = defineCommand({
  meta: {
    name: "codante",
    version: "0.1.0",
    description: "CLI tool for Codante.io coding challenges",
  },
  subCommands: {
    auth: authCommand,
    challenges: challengesCommand,
    start: startCommand,
    submit: submitCommand,
    status: statusCommand,
    done: doneCommand,
    agent: agentCommand,
  },
});

runMain(main);
