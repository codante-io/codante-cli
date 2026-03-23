import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRequireAuth = vi.fn().mockReturnValue("test-token");
const mockGetStatus = vi.fn();

vi.mock("../../src/lib/config.js", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("../../src/lib/api.js", () => ({
  getStatus: (...args: unknown[]) => mockGetStatus(...args),
}));

import { statusCommand } from "../../src/commands/status.js";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  process.exitCode = undefined as unknown as number;
});

const mockChallengeUser = {
  id: 1,
  challenge: { name: "Test" },
  fork_url: "https://github.com/user/repo",
  submission_url: "https://deploy.com",
  submitted_at: "2024-01-01",
  completed: true,
};

describe("status command", () => {
  it("shows challenge status", async () => {
    mockGetStatus.mockResolvedValueOnce(mockChallengeUser);

    await statusCommand.run!({ args: { slug: "test", json: false } } as any);

    expect(mockGetStatus).toHaveBeenCalledWith("test");
    expect(console.log).toHaveBeenCalled();
  });

  it("outputs JSON when --json flag is set", async () => {
    mockGetStatus.mockResolvedValueOnce(mockChallengeUser);

    await statusCommand.run!({ args: { slug: "test", json: true } } as any);

    expect(console.log).toHaveBeenCalledWith(JSON.stringify(mockChallengeUser, null, 2));
  });

  it("fails when not authenticated", async () => {
    mockRequireAuth.mockImplementationOnce(() => {
      throw new Error("Not authenticated");
    });

    await statusCommand.run!({ args: { slug: "test", json: false } } as any);

    expect(process.exitCode).toBe(1);
  });

  it("handles API error", async () => {
    mockGetStatus.mockRejectedValueOnce(new Error("404"));

    await statusCommand.run!({ args: { slug: "test", json: false } } as any);

    expect(process.exitCode).toBe(1);
  });
});
