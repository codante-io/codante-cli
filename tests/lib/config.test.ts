import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("conf", () => {
  const store = new Map<string, string>();
  return {
    default: class {
      constructor() {}
      get(key: string) {
        return store.get(key) || "";
      }
      set(key: string, value: string) {
        store.set(key, value);
      }
      clear() {
        store.clear();
      }
    },
    _store: store,
  };
});

import {
  getToken,
  setToken,
  clearTokens,
  isAuthenticated,
  requireAuth,
} from "../../src/lib/config.js";

beforeEach(() => {
  clearTokens();
  delete process.env.CODANTE_TOKEN;
});

describe("config", () => {
  it("stores and retrieves token", () => {
    setToken("test-token");
    expect(getToken()).toBe("test-token");
  });

  it("clears tokens", () => {
    setToken("test-token");
    clearTokens();
    expect(getToken()).toBe("");
  });

  it("checks authentication status", () => {
    expect(isAuthenticated()).toBe(false);
    setToken("test-token");
    expect(isAuthenticated()).toBe(true);
  });

  it("prefers CODANTE_TOKEN env var", () => {
    process.env.CODANTE_TOKEN = "env-token";
    expect(getToken()).toBe("env-token");
  });

  it("requireAuth throws when not authenticated", () => {
    expect(() => requireAuth()).toThrow("Not authenticated");
  });

  it("requireAuth returns token when authenticated", () => {
    setToken("my-token");
    expect(requireAuth()).toBe("my-token");
  });
});
