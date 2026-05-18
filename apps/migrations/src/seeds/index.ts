// ============================================
// KuliahOnlineIT - Seed Data
// ============================================
// Data awal untuk development

import type PocketBase from "pocketbase";

export async function seedData(pb: PocketBase): Promise<void> {
  console.log("\n🌱 Seeding data...");

  // Seed categories
  const existingCategories = await pb.collection("categories").getFullList();
  if (existingCategories.length === 0) {
    const categories = [
      { name: "Web Development", slug: "web-development", description: "Belajar pengembangan web modern", sort_order: 1 },
      { name: "Mobile Development", slug: "mobile-development", description: "Belajar membuat aplikasi mobile", sort_order: 2 },
      { name: "Data Science", slug: "data-science", description: "Data science & machine learning", sort_order: 3 },
      { name: "UI/UX Design", slug: "ui-ux-design", description: "Desain antarmuka dan pengalaman pengguna", sort_order: 4 },
      { name: "DevOps", slug: "devops", description: "CI/CD, cloud, infrastruktur", sort_order: 5 },
      { name: "Business", slug: "business", description: "Bisnis dan kewirausahaan", sort_order: 6 },
    ];

    for (const cat of categories) {
      await pb.collection("categories").create(cat);
      console.log(`  ➕ Category: ${cat.name}`);
    }
  }

  console.log("✅ Seed data completed!");
}
