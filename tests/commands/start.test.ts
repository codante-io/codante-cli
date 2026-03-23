import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRequireAuth = vi.fn().mockReturnValue("test-token");
const mockGetChallenge = vi.fn();
const mockJoinChallenge = vi.fn();
const mockForkRepo = vi.fn();
const mockCloneRepo = vi.fn();

vi.mock("../../src/lib/config.js", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("../../src/lib/api.js", () => ({
  getChallenge: (...args: unknown[]) => mockGetChallenge(...args),
  joinChallenge: (...args: unknown[]) => mockJoinChallenge(...args),
}));

vi.mock("../../src/lib/github.js", () => ({
  forkRepo: (...args: unknown[]) => mockForkRepo(...args),
  parseRepoName: (url: string) => {
    const match = url.match(/(?:github\.com\/)?([^/\s]+)\/([^/\s.]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  },
}));

vi.mock("../../src/lib/git.js", () => ({
  cloneRepo: (...args: unknown[]) => mockCloneRepo(...args),
  isGitInstalled: () => Promise.resolve(true),
}));

import { startCommand } from "../../src/commands/start.js";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  process.exitCode = undefined as unknown as number;
});

describe("start command", () => {
  it("joins, forks, and clones", async () => {
    mockGetChallenge.mockResolvedValueOnce({
      name: "Test Challenge",
      repository_name: "codante-io/test-repo",
    });
    mockJoinChallenge.mockResolvedValueOnce({});
    mockForkRepo.mockResolvedValueOnce({
      full_name: "user/test-repo",
      clone_url: "https://github.com/user/test-repo.git",
    });
    mockCloneRepo.mockResolvedValueOnce("test-repo");

    await startCommand.run!({ args: { slug: "test", "no-fork": false, "no-clone": false } } as any);

    expect(mockJoinChallenge).toHaveBeenCalledWith("test");
    expect(mockForkRepo).toHaveBeenCalledWith("codante-io/test-repo");
    expect(mockCloneRepo).toHaveBeenCalledWith("https://github.com/user/test-repo.git", undefined);
  });

  it("skips fork with --no-fork", async () => {
    mockGetChallenge.mockResolvedValueOnce({
      name: "Test",
      repository_name: "codante-io/test-repo",
    });
    mockJoinChallenge.mockResolvedValueOnce({});

    await startCommand.run!({ args: { slug: "test", "no-fork": true, "no-clone": false } } as any);

    expect(mockForkRepo).not.toHaveBeenCalled();
    expect(mockCloneRepo).not.toHaveBeenCalled();
  });

  it("skips clone with --no-clone", async () => {
    mockGetChallenge.mockResolvedValueOnce({
      name: "Test",
      repository_name: "codante-io/test-repo",
    });
    mockJoinChallenge.mockResolvedValueOnce({});
    mockForkRepo.mockResolvedValueOnce({
      full_name: "user/test-repo",
      clone_url: "https://github.com/user/test-repo.git",
    });

    await startCommand.run!({ args: { slug: "test", "no-fork": false, "no-clone": true } } as any);

    expect(mockForkRepo).toHaveBeenCalled();
    expect(mockCloneRepo).not.toHaveBeenCalled();
  });

  it("fails when not authenticated", async () => {
    mockRequireAuth.mockImplementationOnce(() => {
      throw new Error("Not authenticated");
    });

    await startCommand.run!({ args: { slug: "test", "no-fork": false, "no-clone": false } } as any);

    expect(process.exitCode).toBe(1);
    expect(mockGetChallenge).not.toHaveBeenCalled();
  });

  it("passes --dir to clone", async () => {
    mockGetChallenge.mockResolvedValueOnce({
      name: "Test",
      repository_name: "codante-io/test-repo",
    });
    mockJoinChallenge.mockResolvedValueOnce({});
    mockForkRepo.mockResolvedValueOnce({
      full_name: "user/test-repo",
      clone_url: "https://github.com/user/test-repo.git",
    });
    mockCloneRepo.mockResolvedValueOnce("my-dir");

    await startCommand.run!({
      args: { slug: "test", "no-fork": false, "no-clone": false, dir: "./my-dir" },
    } as any);

    expect(mockCloneRepo).toHaveBeenCalledWith(
      "https://github.com/user/test-repo.git",
      "./my-dir"
    );
  });
});
