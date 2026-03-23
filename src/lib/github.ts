import { Octokit } from "@octokit/rest";
import { getGithubToken } from "./config.js";

export function createOctokit(token?: string): Octokit {
  return new Octokit({ auth: token || getGithubToken() || undefined });
}

export async function forkRepo(
  repoFullName: string,
  githubToken?: string
): Promise<{ full_name: string; clone_url: string }> {
  const token = githubToken || getGithubToken();
  if (!token) {
    throw new Error(
      "GitHub token required to fork. Run `codante auth login` to get it from your Codante account, or set GITHUB_TOKEN env var."
    );
  }
  const octokit = createOctokit(token);
  const [owner, repo] = repoFullName.split("/");

  if (!owner || !repo) {
    throw new Error(`Invalid repository name: ${repoFullName}`);
  }

  const { data } = await octokit.repos.createFork({ owner, repo });

  return {
    full_name: data.full_name,
    clone_url: data.clone_url,
  };
}

export function parseRepoName(
  repositoryUrl: string
): { owner: string; repo: string } | null {
  const match = repositoryUrl.match(
    /(?:github\.com\/)?([^/\s]+)\/([^/\s.]+)/
  );
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}
