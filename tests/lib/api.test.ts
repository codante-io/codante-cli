import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("ofetch", () => ({
  ofetch: vi.fn(),
}));

vi.mock("../../src/lib/config.js", () => ({
  getToken: vi.fn().mockReturnValue("test-token"),
}));

import { ofetch } from "ofetch";
import {
  getUser,
  getChallenges,
  getChallenge,
  joinChallenge,
  submitChallenge,
  getStatus,
  markComplete,
} from "../../src/lib/api.js";

const mockedFetch = vi.mocked(ofetch);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("api", () => {
  describe("getUser", () => {
    it("calls /user with auth header", async () => {
      mockedFetch.mockResolvedValueOnce({ id: 1, name: "John" });
      const user = await getUser();
      expect(user).toEqual({ id: 1, name: "John" });
      expect(mockedFetch).toHaveBeenCalledWith(
        "https://api.codante.io/api/user",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
    });
  });

  describe("getChallenges", () => {
    it("fetches challenges list", async () => {
      mockedFetch.mockResolvedValueOnce({
        data: { challenges: [{ id: 1, name: "Test" }] },
      });
      const challenges = await getChallenges();
      expect(challenges).toEqual([{ id: 1, name: "Test" }]);
    });

    it("passes filter params", async () => {
      mockedFetch.mockResolvedValueOnce({ data: { challenges: [] } });
      await getChallenges({ difficulty: "1", tech: "react" });
      const calledUrl = mockedFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain("dificuldade=1");
      expect(calledUrl).toContain("tecnologia=react");
    });
  });

  describe("getChallenge", () => {
    it("fetches single challenge", async () => {
      mockedFetch.mockResolvedValueOnce({ data: { id: 1, name: "Test" } });
      const challenge = await getChallenge("test-slug");
      expect(challenge).toEqual({ id: 1, name: "Test" });
      expect(mockedFetch).toHaveBeenCalledWith(
        "https://api.codante.io/api/challenges/test-slug",
        expect.anything()
      );
    });
  });

  describe("joinChallenge", () => {
    it("posts to join endpoint", async () => {
      mockedFetch.mockResolvedValueOnce({});
      await joinChallenge("test-slug");
      expect(mockedFetch).toHaveBeenCalledWith(
        "https://api.codante.io/api/challenges/test-slug/join",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("submitChallenge", () => {
    it("posts submission URL", async () => {
      mockedFetch.mockResolvedValueOnce({});
      await submitChallenge("test-slug", "https://deploy.com");
      expect(mockedFetch).toHaveBeenCalledWith(
        "https://api.codante.io/api/challenges/test-slug/submit",
        expect.objectContaining({
          method: "POST",
          body: { submission_url: "https://deploy.com" },
        })
      );
    });
  });

  describe("getStatus", () => {
    it("fetches challenge status", async () => {
      mockedFetch.mockResolvedValueOnce({ data: { id: 1, completed: true } });
      const status = await getStatus("test-slug");
      expect(status).toEqual({ id: 1, completed: true });
    });
  });

  describe("markComplete", () => {
    it("puts completed flag", async () => {
      mockedFetch.mockResolvedValueOnce({});
      await markComplete("test-slug");
      expect(mockedFetch).toHaveBeenCalledWith(
        "https://api.codante.io/api/challenges/test-slug",
        expect.objectContaining({
          method: "PUT",
          body: { completed: true },
        })
      );
    });
  });
});
