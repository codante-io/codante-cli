import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRequireAuth = vi.fn().mockReturnValue("test-token");
const mockMarkComplete = vi.fn();
const mockGetStatus = vi.fn();

vi.mock("../../src/lib/config.js", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("../../src/lib/api.js", () => ({
  markComplete: (...args: unknown[]) => mockMarkComplete(...args),
  getStatus: (...args: unknown[]) => mockGetStatus(...args),
}));

import { doneCommand } from "../../src/commands/done.js";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  process.exitCode = undefined as unknown as number;
});

describe("done command", () => {
  it("marks challenge as complete after submission", async () => {
    mockGetStatus.mockResolvedValueOnce({ submitted_at: "2024-01-01", completed: false });
    mockMarkComplete.mockResolvedValueOnce({});

    await doneCommand.run!({ args: { slug: "test" } } as any);

    expect(mockMarkComplete).toHaveBeenCalledWith("test");
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("complete"));
  });

  it("blocks completion without submission", async () => {
    mockGetStatus.mockResolvedValueOnce({ submitted_at: null, completed: false });

    await doneCommand.run!({ args: { slug: "test" } } as any);

    expect(process.exitCode).toBe(1);
    expect(mockMarkComplete).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("haven't submitted"));
  });

  it("shows message if already complete", async () => {
    mockGetStatus.mockResolvedValueOnce({ submitted_at: "2024-01-01", completed: true });

    await doneCommand.run!({ args: { slug: "test" } } as any);

    expect(mockMarkComplete).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("already"));
  });

  it("fails when not authenticated", async () => {
    mockRequireAuth.mockImplementationOnce(() => {
      throw new Error("Not authenticated");
    });

    await doneCommand.run!({ args: { slug: "test" } } as any);

    expect(process.exitCode).toBe(1);
    expect(mockMarkComplete).not.toHaveBeenCalled();
  });

  it("handles API error", async () => {
    mockGetStatus.mockRejectedValueOnce(new Error("Server error"));

    await doneCommand.run!({ args: { slug: "test" } } as any);

    expect(process.exitCode).toBe(1);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Failed"));
  });
});
