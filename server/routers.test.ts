import { describe, it, expect } from "vitest";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

function createMockContext(userId: number = 1, role: "user" | "admin" = "user"): TrpcContext {
  const user: User = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "oauth",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {
      clearCookie: () => {},
    } as any,
  };
}

describe("ManhwaForge AI - Context & Auth", () => {
  it("creates valid mock context for authenticated user", () => {
    const ctx = createMockContext(1, "user");
    
    expect(ctx.user).toBeDefined();
    expect(ctx.user?.id).toBe(1);
    expect(ctx.user?.role).toBe("user");
    expect(ctx.user?.email).toContain("@example.com");
  });

  it("creates valid mock context for admin user", () => {
    const ctx = createMockContext(1, "admin");
    
    expect(ctx.user?.role).toBe("admin");
  });

  it("context has required request/response properties", () => {
    const ctx = createMockContext();
    
    expect(ctx.req).toBeDefined();
    expect(ctx.res).toBeDefined();
    expect(ctx.req.protocol).toBe("https");
  });

  it("multiple contexts have different user IDs", () => {
    const ctx1 = createMockContext(1);
    const ctx2 = createMockContext(2);
    
    expect(ctx1.user?.id).not.toBe(ctx2.user?.id);
    expect(ctx1.user?.openId).not.toBe(ctx2.user?.openId);
  });
});

describe("ManhwaForge AI - User Types", () => {
  it("user object has all required fields", () => {
    const ctx = createMockContext();
    const user = ctx.user;
    
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("openId");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("role");
    expect(user).toHaveProperty("createdAt");
    expect(user).toHaveProperty("updatedAt");
  });

  it("user timestamps are valid dates", () => {
    const ctx = createMockContext();
    const user = ctx.user;
    
    expect(user?.createdAt).toBeInstanceOf(Date);
    expect(user?.updatedAt).toBeInstanceOf(Date);
    expect(user?.lastSignedIn).toBeInstanceOf(Date);
  });
});
