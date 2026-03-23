import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreateFork = vi.fn();

vi.mock("@octokit/rest", () => ({
  Octokit: class {
    repos = { createFork: mockCreateFork };
  },
}));

vi.mock("../../src/lib/config.js", () => ({
  getGithubToken: vi.fn().mockReturnValue("gh-token"),
}));

import { forkRepo, createOctokit } from "../../src/lib/github.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("github fork", () => {
  it("forks a repo and returns fork info", async () => {
    mockCreateFork.mockResolvedValueOnce({
      data: {
        full_name: "user/test-repo",
        clone_url: "https://github.com/user/test-repo.git",
      },
    });

    const result = await forkRepo("codante-io/test-repo");
    expect(result).toEqual({
      full_name: "user/test-repo",
      clone_url: "https://github.com/user/test-repo.git",
    });
    expect(mockCreateFork).toHaveBeenCalledWith({
      owner: "codante-io",
      repo: "test-repo",
    });
  });

  it("throws for invalid repo name", async () => {
    await expect(forkRepo("invalid")).rejects.toThrow("Invalid repository name");
  });

  it("creates octokit instance", () => {
    const octokit = createOctokit();
    expect(octokit).toBeDefined();
  });
});
