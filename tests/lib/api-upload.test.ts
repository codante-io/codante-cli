import { describe, it, expect, vi, beforeEach } from "vitest";

const mockOfetch = vi.fn();

vi.mock("ofetch", () => ({
  ofetch: (...args: unknown[]) => mockOfetch(...args),
}));

vi.mock("../../src/lib/config.js", () => ({
  getToken: vi.fn().mockReturnValue("test-token"),
}));

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn().mockResolvedValue(Buffer.from("fake-image-data")),
}));

vi.mock("node:path", () => ({
  basename: vi.fn().mockReturnValue("screenshot.png"),
}));

import { submitWithoutDeploy } from "../../src/lib/api.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("api - submitWithoutDeploy", () => {
  it("sends multipart form data", async () => {
    mockOfetch.mockResolvedValueOnce({});

    await submitWithoutDeploy("test-slug", "/path/to/screenshot.png");

    expect(mockOfetch).toHaveBeenCalledWith(
      "https://api.codante.io/api/challenges/test-slug/submit-without-deploy",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      })
    );

    // Verify auth header is present but Content-Type is not (let browser set boundary)
    const callArgs = mockOfetch.mock.calls[0][1] as any;
    expect(callArgs.headers.Authorization).toBe("Bearer test-token");
    expect(callArgs.headers["Content-Type"]).toBeUndefined();
  });
});
