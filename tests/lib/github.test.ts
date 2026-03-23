import { describe, it, expect, vi } from "vitest";
import { parseRepoName } from "../../src/lib/github.js";

describe("github", () => {
  describe("parseRepoName", () => {
    it("parses full GitHub URL", () => {
      const result = parseRepoName("https://github.com/codante-io/test-repo");
      expect(result).toEqual({ owner: "codante-io", repo: "test-repo" });
    });

    it("parses owner/repo format", () => {
      const result = parseRepoName("codante-io/test-repo");
      expect(result).toEqual({ owner: "codante-io", repo: "test-repo" });
    });

    it("parses URL with .git suffix", () => {
      const result = parseRepoName("https://github.com/codante-io/test-repo.git");
      expect(result).toEqual({ owner: "codante-io", repo: "test-repo" });
    });

    it("returns null for invalid input", () => {
      expect(parseRepoName("not-a-repo")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(parseRepoName("")).toBeNull();
    });
  });
});
