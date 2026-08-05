import { describe, it, expect } from "vitest";
import { parseEnv } from "./env.js";

/**
 * These tests pin the fail-fast contract: production must not boot with a
 * missing or weak secret, and development must boot with no configuration.
 */

const PROD_BASE = {
  NODE_ENV: "production",
  JWT_SECRET: "x".repeat(64),
  CLIENT_URL: "https://example.com",
  ADMIN_EMAIL: "admin@example.com",
  VITE_GOOGLE_CLIENT_ID: "client-id.apps.googleusercontent.com",
  TURSO_DATABASE_URL: "libsql://db.turso.io",
  TURSO_AUTH_TOKEN: "token",
} as NodeJS.ProcessEnv;

describe("parseEnv", () => {
  it("accepts a fully configured production environment", () => {
    const env = parseEnv(PROD_BASE);
    expect(env.NODE_ENV).toBe("production");
    expect(env.JWT_SECRET).toHaveLength(64);
  });

  it("allows development to boot with no configuration", () => {
    const env = parseEnv({} as NodeJS.ProcessEnv);
    expect(env.NODE_ENV).toBe("development");
    expect(env.JWT_SECRET).toBeUndefined();
  });

  it("rejects production without JWT_SECRET", () => {
    const { JWT_SECRET, ...rest } = PROD_BASE;
    expect(() => parseEnv(rest as NodeJS.ProcessEnv)).toThrow(/JWT_SECRET/);
  });

  it("rejects a JWT_SECRET below the minimum length", () => {
    expect(() => parseEnv({ ...PROD_BASE, JWT_SECRET: "short" })).toThrow(/at least 32/);
  });

  it("rejects production without a Turso database", () => {
    const { TURSO_DATABASE_URL, ...rest } = PROD_BASE;
    expect(() => parseEnv(rest as NodeJS.ProcessEnv)).toThrow(/TURSO_DATABASE_URL/);
  });

  it("rejects a Turso URL with no auth token", () => {
    const { TURSO_AUTH_TOKEN, ...rest } = PROD_BASE;
    expect(() => parseEnv(rest as NodeJS.ProcessEnv)).toThrow(/TURSO_AUTH_TOKEN/);
  });

  it("rejects a malformed admin email", () => {
    expect(() => parseEnv({ ...PROD_BASE, ADMIN_EMAIL: "not-an-email" })).toThrow();
  });
});
