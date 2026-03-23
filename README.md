# Codante CLI

CLI tool for [Codante.io](https://codante.io) — browse, start, and submit coding challenges from your terminal.

## Install

```bash
npm install -g codante
```

Or run directly:

```bash
npx codante
```

## Quick Start

```bash
# Login (opens browser to copy token)
codante auth login

# Browse challenges
codante challenges list

# Start a challenge (joins + forks + clones)
codante start mp-tela-login-tailwind

# Submit your deployed solution
codante submit mp-tela-login-tailwind --url https://my-deploy.vercel.app

# Mark as complete
codante done mp-tela-login-tailwind
```

## Commands

### Auth

```bash
codante auth login                  # Opens codante.io/cli/auth, paste token
codante auth login --token <token>  # Direct token auth
codante auth status                 # Show logged-in user
codante auth logout                 # Clear stored credentials
```

You can also set `CODANTE_TOKEN` as an environment variable to skip login.

### Challenges

```bash
codante challenges list                              # List all challenges
codante challenges list --difficulty newbie           # Filter by difficulty
codante challenges list --tech react                 # Filter by technology
codante challenges list --free                       # Only free challenges
codante challenges list --enrolled                   # Challenges you joined
codante challenges list --not-enrolled               # Challenges you haven't done
codante challenges list --json                       # JSON output
codante challenges show <slug>                       # Challenge details
codante challenges show <slug> --json                # JSON output
```

### Start

```bash
codante start <slug>                # Join + fork + clone
codante start <slug> --no-fork      # Join without forking
codante start <slug> --no-clone     # Join + fork without cloning
codante start <slug> --dir ./path   # Clone to specific directory
```

Forking requires a GitHub token. The CLI automatically fetches it from your Codante account (if you logged in with GitHub). You can also set `GITHUB_TOKEN` or `GH_TOKEN` manually.

### Submit

```bash
codante submit <slug> --url <deploy-url>    # Submit with deploy URL
codante submit <slug> --image ./screenshot.png  # Submit with screenshot
```

You must fork the challenge repo before submitting.

### Status

```bash
codante status <slug>                # Show your progress
codante status <slug> --json         # JSON output
codante status <slug> --verify-fork  # Check if fork exists on GitHub
```

### Done

```bash
codante done <slug>   # Mark challenge as complete
```

Requires a submission first.

### Agent

```bash
codante agent   # Output instructions for AI agents (JSON)
```

Returns structured instructions that AI agents can use to help users with Codante challenges, including command reference, workflow steps, and guidelines for guided vs autonomous modes.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CODANTE_TOKEN` | API token (skips `auth login`) |
| `CODANTE_API_URL` | Override API URL (default: `https://api.codante.io/api`) |
| `CODANTE_URL` | Override frontend URL (default: `https://codante.io`) |
| `GITHUB_TOKEN` | GitHub token for forking repos |

## Local Development

To use with a local Codante instance:

```bash
export CODANTE_URL=http://localhost:3000
export CODANTE_API_URL=http://localhost:8000/api
codante auth login
```

## License

MIT
