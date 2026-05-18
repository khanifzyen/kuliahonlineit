// ============================================
// KuliahOnlineIT - Koleksi Database PocketBase
// ============================================
// File ini berisi semua koleksi yang akan dibuat/di-migrate
// ke PocketBase menggunakan Admin API.

import type PocketBase from "pocketbase";
import type { CollectionResponse } from "pocketbase";

interface CollectionSchema {
  name: string;
  type: string;
  schema: Array<{
    name: string;
    type: string;
    required: boolean;
    options?: Record<string, unknown>;
  }>;
  indexes?: string[];
  listRule?: string | null;
  viewRule?: string | null;
  createRule?: string | null;
  updateRule?: string | null;
  deleteRule?: string | null;
}

const collections: CollectionSchema[] = [
  // ==========================================
  // 1. CATEGORIES - Kategori kursus
  // ==========================================
  {
    name: "categories",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.isAdmin = true",
    updateRule: "@request.auth.isAdmin = true",
    deleteRule: "@request.auth.isAdmin = true",
    schema: [
      { name: "name", type: "text", required: true },
      { name: "slug", type: "text", required: true },
      { name: "description", type: "text", required: false },
      { name: "icon", type: "text", required: false },
      { name: "sort_order", type: "number", required: false },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_categories_slug ON categories (slug)"],
  },

  // ==========================================
  // 2. COURSES - Kursus
  // ==========================================
  {
    name: "courses",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "instructor = @request.auth.id",
    updateRule: "instructor = @request.auth.id || @request.auth.isAdmin = true",
    deleteRule: "instructor = @request.auth.id || @request.auth.isAdmin = true",
    schema: [
      { name: "title", type: "text", required: true },
      { name: "slug", type: "text", required: true },
      { name: "subtitle", type: "text", required: false },
      { name: "description", type: "editor", required: false },
      { name: "thumbnail", type: "file", required: false },
      { name: "category", type: "relation", required: false, options: { collectionId: "categories", maxSelect: 1 } },
      { name: "instructor", type: "relation", required: true, options: { collectionId: "users", maxSelect: 1 } },
      { name: "price", type: "number", required: true },
      { name: "discount_price", type: "number", required: false },
      { name: "level", type: "select", required: false, options: { values: ["beginner", "intermediate", "advanced", "all"] } },
      { name: "language", type: "text", required: false },
      { name: "duration", type: "number", required: false }, // total menit
      { name: "status", type: "select", required: true, options: { values: ["draft", "published", "archived"] } },
      { name: "is_featured", type: "bool", required: false },
      { name: "total_lectures", type: "number", required: false },
      { name: "total_students", type: "number", required: false },
      { name: "average_rating", type: "number", required: false },
      { name: "tags", type: "json", required: false },
      { name: "requirements", type: "editor", required: false },
      { name: "what_you_will_learn", type: "editor", required: false },
      { name: "target_audience", type: "editor", required: false },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_courses_slug ON courses (slug)",
      "CREATE INDEX idx_courses_status ON courses (status)",
      "CREATE INDEX idx_courses_category ON courses (category)",
      "CREATE INDEX idx_courses_instructor ON courses (instructor)",
    ],
  },

  // ==========================================
  // 3. SECTIONS - Bab/Bagian dalam kursus
  // ==========================================
  {
    name: "sections",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "course.instructor = @request.auth.id || @request.auth.isAdmin = true",
    updateRule: "course.instructor = @request.auth.id || @request.auth.isAdmin = true",
    deleteRule: "course.instructor = @request.auth.id || @request.auth.isAdmin = true",
    schema: [
      { name: "course", type: "relation", required: true, options: { collectionId: "courses", maxSelect: 1 } },
      { name: "title", type: "text", required: true },
      { name: "sort_order", type: "number", required: true },
      { name: "description", type: "text", required: false },
    ],
    indexes: [
      "CREATE INDEX idx_sections_course ON sections (course)",
      "CREATE INDEX idx_sections_sort ON sections (course, sort_order)",
    ],
  },

  // ==========================================
  // 4. LECTURES - Materi pelajaran (video, artikel, quiz)
  // ==========================================
  {
    name: "lectures",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "section.course.instructor = @request.auth.id || @request.auth.isAdmin = true",
    updateRule: "section.course.instructor = @request.auth.id || @request.auth.isAdmin = true",
    deleteRule: "section.course.instructor = @request.auth.id || @request.auth.isAdmin = true",
    schema: [
      { name: "section", type: "relation", required: true, options: { collectionId: "sections", maxSelect: 1 } },
      { name: "title", type: "text", required: true },
      { name: "description", type: "editor", required: false },
      { name: "type", type: "select", required: true, options: { values: ["video", "article", "quiz", "coding_exercise", "resource"] } },
      { name: "video_url", type: "url", required: false },
      { name: "video_duration", type: "number", required: false },
      { name: "video_qualities", type: "json", required: false }, // { "360p": "url", "720p": "url", "1080p": "url" }
      { name: "article_content", type: "editor", required: false },
      { name: "resource_file", type: "file", required: false },
      { name: "is_free_preview", type: "bool", required: false },
      { name: "sort_order", type: "number", required: true },
      { name: "is_published", type: "bool", required: false },
    ],
    indexes: [
      "CREATE INDEX idx_lectures_section ON lectures (section)",
      "CREATE INDEX idx_lectures_sort ON lectures (section, sort_order)",
    ],
  },

  // ==========================================
  // 5. ENROLLMENTS - Pendaftaran siswa ke kursus
  // ==========================================
  {
    name: "enrollments",
    type: "base",
    listRule: "student = @request.auth.id || @request.auth.isAdmin = true",
    viewRule: "student = @request.auth.id || course.instructor = @request.auth.id || @request.auth.isAdmin = true",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id = student",
    deleteRule: "@request.auth.isAdmin = true",
    schema: [
      { name: "student", type: "relation", required: true, options: { collectionId: "users", maxSelect: 1 } },
      { name: "course", type: "relation", required: true, options: { collectionId: "courses", maxSelect: 1 } },
      { name: "progress", type: "number", required: false }, // 0-100 persen
      { name: "completed", type: "bool", required: false },
      { name: "completed_at", type: "date", required: false },
      { name: "payment_status", type: "select", required: true, options: { values: ["pending", "success", "failed", "refunded"] } },
      { name: "payment_method", type: "text", required: false },
      { name: "payment_details", type: "json", required: false },
      { name: "certificate_url", type: "url", required: false },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_enrollments_unique ON enrollments (student, course)",
      "CREATE INDEX idx_enrollments_student ON enrollments (student)",
      "CREATE INDEX idx_enrollments_course ON enrollments (course)",
    ],
  },

  // ==========================================
  // 6. LECTURE_PROGRESS - Progress per lecture
  // ==========================================
  {
    name: "lecture_progress",
    type: "base",
    listRule: "student = @request.auth.id || @request.auth.isAdmin = true",
    viewRule: "student = @request.auth.id || @request.auth.isAdmin = true",
    createRule: "@request.auth.id = student",
    updateRule: "@request.auth.id = student",
    deleteRule: "@request.auth.isAdmin = true",
    schema: [
      { name: "student", type: "relation", required: true, options: { collectionId: "users", maxSelect: 1 } },
      { name: "lecture", type: "relation", required: true, options: { collectionId: "lectures", maxSelect: 1 } },
      { name: "enrollment", type: "relation", required: true, options: { collectionId: "enrollments", maxSelect: 1 } },
      { name: "completed", type: "bool", required: false },
      { name: "watch_time", type: "number", required: false }, // detik yang sudah ditonton
      { name: "last_position", type: "number", required: false }, // posisi terakhir (detik)
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_lecture_progress_unique ON lecture_progress (student, lecture)",
      "CREATE INDEX idx_lecture_progress_enrollment ON lecture_progress (enrollment)",
    ],
  },

  // ==========================================
  // 7. REVIEWS - Rating & ulasan
  // ==========================================
  {
    name: "reviews",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "student = @request.auth.id || @request.auth.isAdmin = true",
    deleteRule: "student = @request.auth.id || @request.auth.isAdmin = true",
    schema: [
      { name: "course", type: "relation", required: true, options: { collectionId: "courses", maxSelect: 1 } },
      { name: "student", type: "relation", required: true, options: { collectionId: "users", maxSelect: 1 } },
      { name: "rating", type: "number", required: true },
      { name: "comment", type: "editor", required: false },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_reviews_unique ON reviews (student, course)",
      "CREATE INDEX idx_reviews_course ON reviews (course)",
    ],
  },

  // ==========================================
  // 8. WISHLISTS - Wishlist / Save for Later
  // ==========================================
  {
    name: "wishlists",
    type: "base",
    listRule: "student = @request.auth.id",
    viewRule: "student = @request.auth.id",
    createRule: "@request.auth.id = student",
    updateRule: "@request.auth.id = student",
    deleteRule: "student = @request.auth.id || @request.auth.isAdmin = true",
    schema: [
      { name: "student", type: "relation", required: true, options: { collectionId: "users", maxSelect: 1 } },
      { name: "course", type: "relation", required: true, options: { collectionId: "courses", maxSelect: 1 } },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_wishlists_unique ON wishlists (student, course)",
    ],
  },

  // ==========================================
  // 9. Q&A - Pertanyaan & Jawaban
  // ==========================================
  {
    name: "qa_threads",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "student = @request.auth.id || @request.auth.isAdmin = true",
    deleteRule: "student = @request.auth.id || @request.auth.isAdmin = true",
    schema: [
      { name: "course", type: "relation", required: true, options: { collectionId: "courses", maxSelect: 1 } },
      { name: "lecture", type: "relation", required: false, options: { collectionId: "lectures", maxSelect: 1 } },
      { name: "student", type: "relation", required: true, options: { collectionId: "users", maxSelect: 1 } },
      { name: "title", type: "text", required: true },
      { name: "content", type: "editor", required: true },
      { name: "is_resolved", type: "bool", required: false },
    ],
    indexes: [
      "CREATE INDEX idx_qa_threads_course ON qa_threads (course)",
    ],
  },

  // ==========================================
  // 10. QA_ANSWERS - Jawaban untuk Q&A
  // ==========================================
  {
    name: "qa_answers",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "user = @request.auth.id || @request.auth.isAdmin = true",
    deleteRule: "user = @request.auth.id || @request.auth.isAdmin = true",
    schema: [
      { name: "thread", type: "relation", required: true, options: { collectionId: "qa_threads", maxSelect: 1 } },
      { name: "user", type: "relation", required: true, options: { collectionId: "users", maxSelect: 1 } },
      { name: "content", type: "editor", required: true },
      { name: "is_instructor_reply", type: "bool", required: false },
    ],
    indexes: [
      "CREATE INDEX idx_qa_answers_thread ON qa_answers (thread)",
    ],
  },

  // ==========================================
  // 11. COUPONS - Kupon diskon
  // ==========================================
  {
    name: "coupons",
    type: "base",
    listRule: "@request.auth.isAdmin = true",
    viewRule: "@request.auth.isAdmin = true || course.instructor = @request.auth.id",
    createRule: "@request.auth.isAdmin = true || course.instructor = @request.auth.id",
    updateRule: "@request.auth.isAdmin = true || course.instructor = @request.auth.id",
    deleteRule: "@request.auth.isAdmin = true",
    schema: [
      { name: "code", type: "text", required: true },
      { name: "course", type: "relation", required: false, options: { collectionId: "courses", maxSelect: 1 } },
      { name: "discount_type", type: "select", required: true, options: { values: ["percentage", "fixed"] } },
      { name: "discount_value", type: "number", required: true },
      { name: "max_uses", type: "number", required: false },
      { name: "current_uses", type: "number", required: false },
      { name: "expires_at", type: "date", required: false },
      { name: "is_active", type: "bool", required: false },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_coupons_code ON coupons (code)",
    ],
  },

  // ==========================================
  // 12. TRANSACTIONS - Riwayat transaksi
  // ==========================================
  {
    name: "transactions",
    type: "base",
    listRule: "student = @request.auth.id || @request.auth.isAdmin = true",
    viewRule: "student = @request.auth.id || course.instructor = @request.auth.id || @request.auth.isAdmin = true",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.isAdmin = true",
    deleteRule: "@request.auth.isAdmin = true",
    schema: [
      { name: "student", type: "relation", required: true, options: { collectionId: "users", maxSelect: 1 } },
      { name: "course", type: "relation", required: true, options: { collectionId: "courses", maxSelect: 1 } },
      { name: "enrollment", type: "relation", required: false, options: { collectionId: "enrollments", maxSelect: 1 } },
      { name: "amount", type: "number", required: true },
      { name: "fee", type: "number", required: false }, // biaya platform
      { name: "total", type: "number", required: true },
      { name: "currency", type: "text", required: false },
      { name: "payment_method", type: "text", required: false },
      { name: "midtrans_order_id", type: "text", required: false },
      { name: "midtrans_transaction_id", type: "text", required: false },
      { name: "status", type: "select", required: true, options: { values: ["pending", "success", "failed", "refunded"] } },
      { name: "payment_details", type: "json", required: false },
    ],
    indexes: [
      "CREATE INDEX idx_transactions_student ON transactions (student)",
      "CREATE INDEX idx_transactions_status ON transactions (status)",
      "CREATE INDEX idx_transactions_midtrans ON transactions (midtrans_order_id)",
    ],
  },

  // ==========================================
  // 13. CERTIFICATES - Sertifikat kelulusan
  // ==========================================
  {
    name: "certificates",
    type: "base",
    listRule: "student = @request.auth.id || @request.auth.isAdmin = true",
    viewRule: "student = @request.auth.id || course.instructor = @request.auth.id || @request.auth.isAdmin = true",
    createRule: "@request.auth.isAdmin = true",
    updateRule: "@request.auth.isAdmin = true",
    deleteRule: "@request.auth.isAdmin = true",
    schema: [
      { name: "student", type: "relation", required: true, options: { collectionId: "users", maxSelect: 1 } },
      { name: "course", type: "relation", required: true, options: { collectionId: "courses", maxSelect: 1 } },
      { name: "enrollment", type: "relation", required: true, options: { collectionId: "enrollments", maxSelect: 1 } },
      { name: "certificate_number", type: "text", required: true },
      { name: "certificate_url", type: "url", required: false },
      { name: "issued_at", type: "date", required: false },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_certificates_unique ON certificates (student, course)",
      "CREATE UNIQUE INDEX idx_certificates_number ON certificates (certificate_number)",
    ],
  },

  // ==========================================
  // 14. NOTES - Catatan siswa per lecture
  // ==========================================
  {
    name: "notes",
    type: "base",
    listRule: "student = @request.auth.id",
    viewRule: "student = @request.auth.id",
    createRule: "@request.auth.id = student",
    updateRule: "@request.auth.id = student",
    deleteRule: "student = @request.auth.id",
    schema: [
      { name: "student", type: "relation", required: true, options: { collectionId: "users", maxSelect: 1 } },
      { name: "lecture", type: "relation", required: true, options: { collectionId: "lectures", maxSelect: 1 } },
      { name: "content", type: "editor", required: true },
      { name: "timestamp", type: "number", required: false }, // timestamp video (detik)
    ],
    indexes: [
      "CREATE INDEX idx_notes_student ON notes (student)",
      "CREATE INDEX idx_notes_lecture ON notes (lecture)",
    ],
  },

  // ==========================================
  // 15. ANNOUNCEMENTS - Pengumuman instructor
  // ==========================================
  {
    name: "announcements",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "course.instructor = @request.auth.id || @request.auth.isAdmin = true",
    updateRule: "course.instructor = @request.auth.id || @request.auth.isAdmin = true",
    deleteRule: "course.instructor = @request.auth.id || @request.auth.isAdmin = true",
    schema: [
      { name: "course", type: "relation", required: true, options: { collectionId: "courses", maxSelect: 1 } },
      { name: "title", type: "text", required: true },
      { name: "content", type: "editor", required: true },
    ],
    indexes: [
      "CREATE INDEX idx_announcements_course ON announcements (course)",
    ],
  },
];

export async function migrateCollections(pb: PocketBase): Promise<void> {
  console.log("\n📦 Migrating collections...");

  const existingCollections = await pb.collections.getFullList();

  for (const col of collections) {
    const existing = existingCollections.find((c) => c.name === col.name);
    const schema = col.schema.map((s) => ({
      name: s.name,
      type: s.type,
      required: s.required,
      options: s.options || {},
    }));

    if (existing) {
      console.log(`  🔄 Updating collection: ${col.name}`);
      await pb.collections.update(existing.id, {
        name: col.name,
        type: col.type,
        schema,
        indexes: col.indexes || [],
        listRule: col.listRule ?? null,
        viewRule: col.viewRule ?? null,
        createRule: col.createRule ?? null,
        updateRule: col.updateRule ?? null,
        deleteRule: col.deleteRule ?? null,
      } as any);
    } else {
      console.log(`  ➕ Creating collection: ${col.name}`);
      await pb.collections.create({
        name: col.name,
        type: col.type,
        schema,
        indexes: col.indexes || [],
        listRule: col.listRule ?? null,
        viewRule: col.viewRule ?? null,
        createRule: col.createRule ?? null,
        updateRule: col.updateRule ?? null,
        deleteRule: col.deleteRule ?? null,
      } as any);
    }
  }

  console.log("✅ All collections migrated!");
}
