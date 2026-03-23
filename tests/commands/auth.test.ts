import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSetToken = vi.fn();
const mockClearTokens = vi.fn();
const mockIsAuthenticated = vi.fn();
const mockGetUser = vi.fn();

vi.mock("../../src/lib/config.js", () => ({
  setToken: (...args: unknown[]) => mockSetToken(...args),
  clearTokens: () => mockClearTokens(),
  isAuthenticated: () => mockIsAuthenticated(),
  getToken: vi.fn().mockReturnValue(""),
}));

vi.mock("../../src/lib/api.js", () => ({
  getUser: () => mockGetUser(),
}));

import { authCommand } from "../../src/commands/auth.js";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  process.exitCode = undefined as unknown as number;
});

describe("auth command", () => {
  describe("login --token", () => {
    it("stores valid token", async () => {
      mockGetUser.mockResolvedValueOnce({ name: "John" });

      await authCommand.subCommands!.login.run!({ args: { token: "my-token" } } as any);

      expect(mockSetToken).toHaveBeenCalledWith("my-token");
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Authenticated"));
    });

    it("rejects invalid token", async () => {
      mockGetUser.mockRejectedValueOnce(new Error("401"));

      await authCommand.subCommands!.login.run!({ args: { token: "bad-token" } } as any);

      expect(mockClearTokens).toHaveBeenCalled();
      expect(process.exitCode).toBe(1);
    });
  });

  describe("status subcommand", () => {
    it("shows authenticated user", async () => {
      mockIsAuthenticated.mockReturnValueOnce(true);
      mockGetUser.mockResolvedValueOnce({
        name: "John",
        email: "john@test.com",
        github_user: "johndoe",
        is_pro: false,
      });

      await authCommand.subCommands!.status.run!({ args: {} } as any);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Authenticated"));
    });

    it("shows not authenticated", async () => {
      mockIsAuthenticated.mockReturnValueOnce(false);

      await authCommand.subCommands!.status.run!({ args: {} } as any);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Not authenticated"));
      expect(process.exitCode).toBe(1);
    });
  });

  describe("logout subcommand", () => {
    it("clears tokens", () => {
      authCommand.subCommands!.logout.run!({ args: {} } as any);

      expect(mockClearTokens).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Logged out"));
    });
  });
});
