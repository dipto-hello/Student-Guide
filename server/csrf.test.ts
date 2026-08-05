import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { csrfProtection, csrfTokenIssuer, CSRF_COOKIE, CSRF_HEADER } from "./csrf.js";

function mockReq(overrides: Record<string, unknown> = {}): Request {
  return {
    method: "POST",
    path: "/api/user/courses",
    originalUrl: "/api/user/courses",
    cookies: {},
    headers: {},
    ...overrides,
  } as unknown as Request;
}

function mockRes() {
  const res = {
    cookie: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response & {
    cookie: ReturnType<typeof vi.fn>;
    status: ReturnType<typeof vi.fn>;
  };
}

describe("csrfProtection", () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it("allows safe methods without a token", () => {
    const res = mockRes();
    csrfProtection(mockReq({ method: "GET" }), res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("exempts the Google login route, which has no session yet", () => {
    const res = mockRes();
    csrfProtection(
      mockReq({ path: "/api/auth/google", originalUrl: "/api/auth/google" }),
      res,
      next,
    );

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("rejects a state-changing request with no token", () => {
    const res = mockRes();
    csrfProtection(mockReq(), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("rejects when the header does not match the cookie", () => {
    const res = mockRes();
    csrfProtection(
      mockReq({
        cookies: { [CSRF_COOKIE]: "a".repeat(64) },
        headers: { [CSRF_HEADER]: "b".repeat(64) },
      }),
      res,
      next,
    );

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("rejects a header of a different length without throwing", () => {
    // timingSafeEqual throws on length mismatch, so safeEqual must length-check
    // first — a crash here would surface as a 500 instead of a 403.
    const res = mockRes();
    csrfProtection(
      mockReq({
        cookies: { [CSRF_COOKIE]: "a".repeat(64) },
        headers: { [CSRF_HEADER]: "short" },
      }),
      res,
      next,
    );

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("accepts a matching double-submit token", () => {
    const token = "a".repeat(64);
    const res = mockRes();
    csrfProtection(
      mockReq({ cookies: { [CSRF_COOKIE]: token }, headers: { [CSRF_HEADER]: token } }),
      res,
      next,
    );

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("csrfTokenIssuer", () => {
  it("sets a client-readable cookie when none exists", () => {
    const res = mockRes();
    const next = vi.fn();

    csrfTokenIssuer(mockReq({ method: "GET" }), res, next);

    expect(res.cookie).toHaveBeenCalledWith(
      CSRF_COOKIE,
      expect.stringMatching(/^[0-9a-f]{64}$/),
      expect.objectContaining({ httpOnly: false }),
    );
    expect(next).toHaveBeenCalledOnce();
  });

  it("does not reissue when a token is already present", () => {
    const res = mockRes();
    const next = vi.fn();

    csrfTokenIssuer(
      mockReq({ method: "GET", cookies: { [CSRF_COOKIE]: "existing" } }),
      res,
      next,
    );

    expect(res.cookie).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });
});
