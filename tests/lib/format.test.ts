import { describe, it, expect } from "vitest";
import {
  formatChallengesTable,
  formatChallengeDetail,
  formatStatus,
  formatUser,
} from "../../src/lib/format.js";
import type { ChallengeCard, Challenge, ChallengeUser, User } from "../../src/types.js";

const mockChallengeCard: ChallengeCard = {
  id: 1,
  name: "Test Challenge",
  slug: "test-challenge",
  image_url: "https://example.com/img.png",
  status: "published",
  difficulty: "newbie",
  has_solution: false,
  estimated_effort: "1h",
  category: "frontend",
  is_premium: false,
  main_technology: { id: 1, name: "React", slug: "react" },
  tags: [{ id: 1, name: "React", slug: "react" }],
  enrolled_users_count: 42,
  current_user_is_enrolled: false,
};

const mockChallenge: Challenge = {
  id: 1,
  name: "Test Challenge",
  slug: "test-challenge",
  image_url: "https://example.com/img.png",
  video_url: "",
  status: "published",
  difficulty: "intermediate",
  duration_in_minutes: 60,
  repository_name: "codante-io/test-challenge",
  featured: null,
  short_description: "A test challenge",
  description: "<p>Full description</p>",
  has_solution: false,
  is_premium: false,
  resources: [],
  enrolled_users_count: 42,
  current_user_is_enrolled: false,
  current_user_status: null,
  tags: [{ id: 1, name: "React", slug: "react" }],
  stars: 10,
  forks: 5,
};

const mockUser: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  github_id: "123",
  github_user: "johndoe",
  discord_user: null,
  linkedin_user: null,
  is_pro: true,
  is_admin: false,
  created_at: "2024-01-01",
  avatar: { avatar_url: null, name: "John Doe", badge: "pro", github_user: "johndoe" },
};

const mockChallengeUser: ChallengeUser = {
  id: 1,
  user: mockUser,
  challenge: { id: 1, name: "Test Challenge", slug: "test-challenge", short_description: "Test", image_url: "", status: "published" },
  submission_url: "https://my-deploy.com",
  fork_url: "https://github.com/johndoe/test-challenge",
  joined_discord: true,
  completed: true,
  submission_image_url: "https://s3.example.com/img.webp",
  submitted_at: "2024-06-01T12:00:00Z",
  created_at: "2024-05-01T12:00:00Z",
  updated_at: "2024-06-01T12:00:00Z",
  listed: true,
};

describe("format", () => {
  describe("formatChallengesTable", () => {
    it("formats challenges as a table", () => {
      const output = formatChallengesTable([mockChallengeCard]);
      expect(output).toContain("Test Challenge");
      expect(output).toContain("React");
      expect(output).toContain("42");
    });

    it("handles empty list", () => {
      const output = formatChallengesTable([]);
      expect(output).toContain("Name");
    });

    it("shows dash for missing technology", () => {
      const card = { ...mockChallengeCard, main_technology: null };
      const output = formatChallengesTable([card]);
      expect(output).toContain("-");
    });
  });

  describe("formatChallengeDetail", () => {
    it("formats challenge detail", () => {
      const output = formatChallengeDetail(mockChallenge);
      expect(output).toContain("Test Challenge");
      expect(output).toContain("test-challenge");
      expect(output).toContain("React");
      expect(output).toContain("42 users");
      expect(output).toContain("codante-io/test-challenge");
    });
  });

  describe("formatStatus", () => {
    it("shows all completed steps", () => {
      const output = formatStatus(mockChallengeUser);
      expect(output).toContain("Test Challenge");
      expect(output).toContain("\u2713"); // checkmark
    });

    it("shows incomplete steps", () => {
      const incomplete = { ...mockChallengeUser, fork_url: null, submission_url: null, submitted_at: null, completed: false };
      const output = formatStatus(incomplete);
      expect(output).toContain("\u2717"); // cross
    });
  });

  describe("formatUser", () => {
    it("formats user info", () => {
      const output = formatUser(mockUser);
      expect(output).toContain("John Doe");
      expect(output).toContain("john@example.com");
      expect(output).toContain("johndoe");
    });
  });
});
