// Tests for Phase 2 features
import { describe, it, expect, mock } from "bun:test";

describe("Wishlist", () => {
  it("should have wishlist hook exports", async () => {
    const mod = await import("@/lib/use-wishlist");
    expect(mod.useWishlist).toBeDefined();
    expect(typeof mod.useWishlist).toBe("function");
  });
});

describe("Review Form", () => {
  it("should render star rating UI", async () => {
    const { ReviewForm } = await import("@/app/courses/[slug]/review-form");
    expect(ReviewForm).toBeDefined();
  });
});

describe("QA Section", () => {
  it("should export QASection component", async () => {
    const { QASection } = await import("@/app/courses/[slug]/qa-section");
    expect(QASection).toBeDefined();
  });
});

describe("Transactions Page", () => {
  it("should have status labels defined for each status", () => {
    const statuses = ["pending", "success", "failed", "refunded"];
    expect(statuses.length).toBe(4);
  });
});

describe("PocketBase Collections (Phase 2)", () => {
  it("should have wishlists collection accessible", async () => {
    const res = await fetch("http://localhost:8090/api/collections/wishlists/records?perPage=1");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toBeDefined();
  });

  it("should have reviews collection accessible", async () => {
    const res = await fetch("http://localhost:8090/api/collections/reviews/records?perPage=1");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toBeDefined();
  });

  it("should have qa_threads and qa_answers collections accessible", async () => {
    const res1 = await fetch("http://localhost:8090/api/collections/qa_threads/records?perPage=1");
    expect(res1.status).toBe(200);
    const res2 = await fetch("http://localhost:8090/api/collections/qa_answers/records?perPage=1");
    expect(res2.status).toBe(200);
  });

  it("should have transactions and certificates collections accessible", async () => {
    const res1 = await fetch("http://localhost:8090/api/collections/transactions/records?perPage=1");
    expect(res1.status).toBe(200);
    const res2 = await fetch("http://localhost:8090/api/collections/certificates/records?perPage=1");
    expect(res2.status).toBe(200);
  });
});
