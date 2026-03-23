import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetChallenges = vi.fn();
const mockGetChallenge = vi.fn();

vi.mock("../../src/lib/api.js", () => ({
  getChallenges: (...args: unknown[]) => mockGetChallenges(...args),
  getChallenge: (...args: unknown[]) => mockGetChallenge(...args),
}));

import { challengesCommand } from "../../src/commands/challenges.js";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  process.exitCode = undefined as unknown as number;
});

describe("challenges command", () => {
  describe("list", () => {
    it("lists challenges as table", async () => {
      mockGetChallenges.mockResolvedValueOnce([
        { id: 1, name: "Test", slug: "test", difficulty: "newbie", main_technology: { name: "React" }, enrolled_users_count: 10 },
      ]);

      await challengesCommand.subCommands!.list.run!({ args: { json: false } } as any);
      expect(console.log).toHaveBeenCalled();
      expect(mockGetChallenges).toHaveBeenCalled();
    });

    it("outputs JSON when --json flag is set", async () => {
      const challenges = [{ id: 1, name: "Test" }];
      mockGetChallenges.mockResolvedValueOnce(challenges);

      await challengesCommand.subCommands!.list.run!({ args: { json: true } } as any);
      expect(console.log).toHaveBeenCalledWith(JSON.stringify(challenges, null, 2));
    });

    it("passes filters to API", async () => {
      mockGetChallenges.mockResolvedValueOnce([]);

      await challengesCommand.subCommands!.list.run!({
        args: { json: false, difficulty: "1", tech: "react" },
      } as any);

      expect(mockGetChallenges).toHaveBeenCalledWith({
        difficulty: "1",
        tech: "react",
      });
    });

    it("shows message for empty results", async () => {
      mockGetChallenges.mockResolvedValueOnce([]);

      await challengesCommand.subCommands!.list.run!({ args: { json: false } } as any);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("No challenges found"));
    });

    it("handles API error", async () => {
      mockGetChallenges.mockRejectedValueOnce(new Error("Network error"));

      await challengesCommand.subCommands!.list.run!({ args: { json: false } } as any);
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Failed to fetch"));
      expect(process.exitCode).toBe(1);
    });
  });

  describe("show", () => {
    it("shows challenge detail", async () => {
      mockGetChallenge.mockResolvedValueOnce({
        name: "Test", slug: "test", difficulty: "newbie", status: "published",
        tags: [], enrolled_users_count: 10, repository_name: "org/repo",
        is_premium: false, short_description: "Desc",
      });

      await challengesCommand.subCommands!.show.run!({ args: { slug: "test", json: false } } as any);
      expect(console.log).toHaveBeenCalled();
    });

    it("outputs JSON when --json flag is set", async () => {
      const challenge = { id: 1, name: "Test" };
      mockGetChallenge.mockResolvedValueOnce(challenge);

      await challengesCommand.subCommands!.show.run!({ args: { slug: "test", json: true } } as any);
      expect(console.log).toHaveBeenCalledWith(JSON.stringify(challenge, null, 2));
    });

    it("handles not found", async () => {
      mockGetChallenge.mockRejectedValueOnce(new Error("404 Not Found"));

      await challengesCommand.subCommands!.show.run!({ args: { slug: "bad", json: false } } as any);
      expect(process.exitCode).toBe(1);
    });
  });
});
