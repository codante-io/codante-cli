import { describe, it, expect, vi } from "vitest";

vi.mock("execa", () => ({
  execa: vi.fn().mockResolvedValue({ stdout: "", stderr: "" }),
}));

import { cloneRepo, isGitInstalled } from "../../src/lib/git.js";
import { execa } from "execa";

describe("git", () => {
  describe("cloneRepo", () => {
    it("calls git clone with URL", async () => {
      await cloneRepo("https://github.com/user/repo.git");
      expect(execa).toHaveBeenCalledWith("git", [
        "clone",
        "https://github.com/user/repo.git",
      ]);
    });

    it("calls git clone with directory", async () => {
      await cloneRepo("https://github.com/user/repo.git", "./my-dir");
      expect(execa).toHaveBeenCalledWith("git", [
        "clone",
        "https://github.com/user/repo.git",
        "./my-dir",
      ]);
    });

    it("returns directory name from URL", async () => {
      const dir = await cloneRepo("https://github.com/user/my-repo.git");
      expect(dir).toBe("my-repo");
    });

    it("returns provided directory name", async () => {
      const dir = await cloneRepo("https://github.com/user/repo.git", "custom-dir");
      expect(dir).toBe("custom-dir");
    });
  });

  describe("isGitInstalled", () => {
    it("returns true when git is available", async () => {
      const result = await isGitInstalled();
      expect(result).toBe(true);
    });

    it("returns false when git is not available", async () => {
      vi.mocked(execa).mockRejectedValueOnce(new Error("not found"));
      const result = await isGitInstalled();
      expect(result).toBe(false);
    });
  });
});
