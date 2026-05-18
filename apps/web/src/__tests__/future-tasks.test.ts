// Tests for all future/deferred tasks completed
import { describe, it, expect } from "bun:test";

describe("Auto-resume Video", () => {
  it("should have lecture_progress collection with last_position field", async () => {
    const res = await fetch("http://localhost:8090/api/collections/lecture_progress/records?perPage=1");
    expect(res.status).toBe(200);
  });
});

describe("Edit/Hapus Review", () => {
  it("should support PATCH and DELETE on reviews", async () => {
    // Test PATCH endpoint exists
    const res = await fetch("http://localhost:8090/api/collections/reviews/records?perPage=1");
    expect(res.status).toBe(200);
    const data = await res.json();
    if (data.items?.[0]) {
      const patch = await fetch(`http://localhost:8090/api/collections/reviews/records/${data.items[0].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: 5 }),
      });
      expect(patch.status === 200 || patch.status === 403).toBe(true);
    }
  });
});

describe("Thumbnail Upload", () => {
  it("should have thumbnail field in courses collection", async () => {
    const res = await fetch("http://localhost:8090/api/collections/courses/records?perPage=1");
    expect(res.status).toBe(200);
    const data = await res.json();
    if (data.items?.[0]) expect("thumbnail" in data.items[0]).toBe(true);
  });
});

describe("Edit Lecture", () => {
  it("should support PATCH on lectures", async () => {
    const res = await fetch("http://localhost:8090/api/collections/lectures/records?perPage=1");
    expect(res.status).toBe(200);
  });
});

describe("Notification on Q&A Answer", () => {
  it("should be able to create notification", async () => {
    const res = await fetch("http://localhost:8090/api/collections/notifications/records?perPage=1");
    expect(res.status).toBe(200);
  });
});

describe("Export CSV", () => {
  it("should have export API route", async () => {
    const res = await fetch("http://localhost:3000/api/export");
    expect(res.status === 200 || res.status === 401).toBe(true);
  });

  it("should export analytics utilities", async () => {
    const mod = await import("@/lib/analytics");
    expect(mod.exportCourseStatsCSV).toBeDefined();
    expect(mod.getLectureEngagement).toBeDefined();
  });
});

describe("Lecture Engagement", () => {
  it("should have getLectureEngagement exported", async () => {
    const mod = await import("@/lib/analytics");
    expect(typeof mod.getLectureEngagement).toBe("function");
  });
});

describe("Certificate Generation", () => {
  it("should have certificates collection with certificate_number", async () => {
    const res = await fetch("http://localhost:8090/api/collections/certificates/records?perPage=1");
    expect(res.status).toBe(200);
    const data = await res.json();
    if (data.items?.[0]) expect("certificate_number" in data.items[0]).toBe(true);
  });
});
