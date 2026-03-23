import { describe, it, expect, vi, beforeEach } from "vitest";
import { access } from "node:fs/promises";

const mockRequireAuth = vi.fn().mockReturnValue("test-token");
const mockSubmitWithoutDeploy = vi.fn();

vi.mock("../../src/lib/config.js", () => ({
  requireAuth: () => mockRequireAuth(),
}));

vi.mock("../../src/lib/api.js", () => ({
  submitChallenge: vi.fn(),
  submitWithoutDeploy: (...args: unknown[]) => mockSubmitWithoutDeploy(...args),
}));

vi.mock("node:fs/promises", () => ({
  access: vi.fn(),
}));

import { submitCommand } from "../../src/commands/submit.js";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  process.exitCode = undefined as unknown as number;
});

describe("submit command - image", () => {
  it("submits with image file", async () => {
    vi.mocked(access).mockResolvedValueOnce(undefined);
    mockSubmitWithoutDeploy.mockResolvedValueOnce({});

    await submitCommand.run!({ args: { slug: "test", image: "./screenshot.png" } } as any);

    expect(mockSubmitWithoutDeploy).toHaveBeenCalledWith("test", "./screenshot.png");
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Submitted successfully"));
  });

  it("fails when image file not found", async () => {
    vi.mocked(access).mockRejectedValueOnce(new Error("ENOENT"));

    await submitCommand.run!({ args: { slug: "test", image: "./nonexistent.png" } } as any);

    expect(process.exitCode).toBe(1);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("File not found"));
    expect(mockSubmitWithoutDeploy).not.toHaveBeenCalled();
  });
});
