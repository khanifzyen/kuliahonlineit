// Test setup for KuliahOnlineIT
import { afterEach } from "bun:test";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Set up environment variables for tests
process.env.POCKETBASE_URL = "http://localhost:8090";
process.env.AUTH_SECRET = "test-secret-key";
process.env.NEXT_PUBLIC_APP_NAME = "KuliahOnlineIT";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
