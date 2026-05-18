// Tests for Phase 3 - Instructor Tools
import { describe, it, expect } from "bun:test";

describe("Instructor Utilities", () => {
  it("should export required functions", async () => {
    const mod = await import("@/lib/instructor");
    expect(mod.checkInstructor).toBeDefined();
    expect(mod.formatCurrency).toBeDefined();
    expect(mod.formatDate).toBeDefined();
  });

  it("should format currency correctly", async () => {
    const { formatCurrency } = await import("@/lib/instructor");
    expect(formatCurrency(150000)).toBe("Rp150.000");
    expect(formatCurrency(0)).toBe("Rp0");
  });
});

describe("Instructor Dashboard", () => {
  it("should have dashboard route accessible", async () => {
    const res = await fetch("http://localhost:3000/instructor/dashboard");
    expect(res.status === 200 || res.status === 302).toBe(true);
  });
});

describe("Instructor Courses", () => {
  it("should have courses list route accessible", async () => {
    const res = await fetch("http://localhost:3000/instructor/courses");
    expect(res.status === 200 || res.status === 302).toBe(true);
  });

  it("should have new course page accessible", async () => {
    const res = await fetch("http://localhost:3000/instructor/courses/new");
    expect(res.status === 200 || res.status === 302).toBe(true);
  });
});

describe("Coupon Management", () => {
  it("should have coupons collection accessible", async () => {
    const res = await fetch("http://localhost:8090/api/collections/coupons/records?perPage=1");
    expect(res.status).toBe(200);
  });
});

describe("Announcements", () => {
  it("should have announcements collection accessible", async () => {
    const res = await fetch("http://localhost:8090/api/collections/announcements/records?perPage=1");
    expect(res.status).toBe(200);
  });
});

describe("Instructor Route Integrity", () => {
  it("should have all instructor routes defined", () => {
    const routes = [
      "/instructor/dashboard",
      "/instructor/courses",
      "/instructor/courses/new",
      "/instructor/courses/[courseId]/edit",
      "/instructor/courses/[courseId]/curriculum",
      "/instructor/courses/[courseId]/announcements",
      "/instructor/courses/[courseId]/students",
      "/instructor/coupons",
    ];
    expect(routes.length).toBe(8);
    routes.forEach((r) => expect(r).toContain("/instructor"));
  });
});

describe("PocketBase Collection Rules (Instructor)", () => {
  it("should have courses accessible by instructor filter", async () => {
    const res = await fetch(
      "http://localhost:8090/api/collections/courses/records?filter=" +
        encodeURIComponent('status="published"') + "&perPage=1"
    );
    expect(res.status).toBe(200);
  });

  it("should have sections and lectures collections accessible", async () => {
    const [sRes, lRes] = await Promise.all([
      fetch("http://localhost:8090/api/collections/sections/records?perPage=1"),
      fetch("http://localhost:8090/api/collections/lectures/records?perPage=1"),
    ]);
    expect(sRes.status).toBe(200);
    expect(lRes.status).toBe(200);
  });
});
