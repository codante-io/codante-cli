import Conf from "conf";

interface ConfigSchema {
  token: string;
  githubToken: string;
}

const config = new Conf<ConfigSchema>({
  projectName: "codante",
  defaults: {
    token: "",
    githubToken: "",
  },
});

export function getToken(): string {
  return process.env.CODANTE_TOKEN || config.get("token");
}

export function setToken(token: string): void {
  config.set("token", token);
}

export function getGithubToken(): string {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || config.get("githubToken");
}

export function setGithubToken(token: string): void {
  config.set("githubToken", token);
}

export function clearTokens(): void {
  config.set("token", "");
  config.set("githubToken", "");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function requireAuth(): string {
  const token = getToken();
  if (!token) {
    throw new Error(
      "Not authenticated. Run `codante auth login` or set CODANTE_TOKEN env var."
    );
  }
  return token;
}
