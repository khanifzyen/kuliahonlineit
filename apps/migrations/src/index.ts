// ============================================
// KuliahOnlineIT - PocketBase Migration Runner
// ============================================
// Gunakan script ini untuk menjalankan migrasi koleksi
// dan seed data ke PocketBase via JS SDK.
//
// Cara pakai:
//   cd apps/migrations
//   bun run start
//
// Atau dari root:
//   bun run migrate

import PocketBase from "pocketbase";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(import.meta.dirname, "../../../.env") });

const PB_URL = process.env.POCKETBASE_URL || "http://localhost:8090";
const PB_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || "admin@kuliahonlineit.com";
const PB_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || "admin123456";

async function main() {
  console.log("🚀 KuliahOnlineIT Migration Runner");
  console.log(`🔗 Connecting to PocketBase: ${PB_URL}`);

  const pb = new PocketBase(PB_URL);

  try {
    // Authenticate as admin
    await pb.admins.authWithPassword(PB_EMAIL, PB_PASSWORD);
    console.log("✅ Authenticated as admin");

    // ========================================
    // Jalankan migrasi collections
    // ========================================
    const { migrateCollections } = await import("./collections/index.js");
    await migrateCollections(pb);

    // ========================================
    // Jalankan seed data (optional)
    // ========================================
    const { seedData } = await import("./seeds/index.js");
    await seedData(pb);

    console.log("🎉 All migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
