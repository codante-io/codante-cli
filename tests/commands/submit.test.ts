import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRequireAuth = vi.fn().mockReturnValue("test-token");
const mockSubmitChallenge = vi.fn();
const mockSubmitWithoutDeploy = vi.fn();

vi.mock("../../src/lib/config.js", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("../../src/lib/api.js", () => ({
  submitChallenge: (...args: unknown[]) => mockSubmitChallenge(...args),
  submitWithoutDeploy: (...args: unknown[]) => mockSubmitWithoutDeploy(...args),
}));

import { submitCommand } from "../../src/commands/submit.js";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  process.exitCode = undefined as unknown as number;
});

describe("submit command", () => {
  it("submits with URL", async () => {
    mockSubmitChallenge.mockResolvedValueOnce({});

    await submitCommand.run!({ args: { slug: "test", url: "https://deploy.com" } } as any);

    expect(mockSubmitChallenge).toHaveBeenCalledWith("test", "https://deploy.com");
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Submitted successfully"));
  });

  it("fails when neither --url nor --image provided", async () => {
    await submitCommand.run!({ args: { slug: "test" } } as any);

    expect(process.exitCode).toBe(1);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("--url or --image"));
  });

  it("fails when not authenticated", async () => {
    mockRequireAuth.mockImplementationOnce(() => {
      throw new Error("Not authenticated");
    });

    await submitCommand.run!({ args: { slug: "test", url: "https://deploy.com" } } as any);

    expect(process.exitCode).toBe(1);
    expect(mockSubmitChallenge).not.toHaveBeenCalled();
  });

  it("handles submission error", async () => {
    mockSubmitChallenge.mockRejectedValueOnce(new Error("Already submitted"));

    await submitCommand.run!({ args: { slug: "test", url: "https://deploy.com" } } as any);

    expect(process.exitCode).toBe(1);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Submission failed"));
  });
});
