// Test for PocketBase utility
import { describe, it, expect } from "bun:test";

describe("PocketBase Utility", () => {
  it("should have POCKETBASE_URL defined", () => {
    expect(process.env.POCKETBASE_URL).toBe("http://localhost:8090");
  });

  it("should create a PocketBase instance with correct URL", async () => {
    const { getPocketBase } = await import("@/lib/pocketbase");
    const pb = getPocketBase();
    expect(pb).toBeDefined();
    expect((pb as any).baseURL).toBe("http://localhost:8090");
  });
});
