// ============================================
// KuliahOnlineIT - Koleksi Database PocketBase
// ============================================
// PocketBase 0.38+ menggunakan "fields" bukan "schema"
// Setiap field punya properti yang dieksplisitkan

import type PocketBase from "pocketbase";

interface FieldDef {
  name: string;
  type: string;
  required?: boolean;
  // Text options
  max?: number;
  min?: number;
  pattern?: string;
  // Select options
  values?: string[];
  maxSelect?: number;
  // Relation options
  collectionId?: string;
  collectionName?: string;
  // Number options
  onlyInt?: boolean;
  min?: number;
  max?: number;
  // File options
  maxSize?: number;
  mimeTypes?: string[];
  thumbs?: string[];
  // Bool
  // JSON
  // Editor
  // Date
  // URL
  // Email
  // Autodate
  // Password
  // Color
}

interface CollectionDef {
  name: string;
  type: "base" | "auth";
  fields: FieldDef[];
  indexes?: string[];
  listRule?: string | null;
  viewRule?: string | null;
  createRule?: string | null;
  updateRule?: string | null;
  deleteRule?: string | null;
}

const collections: CollectionDef[] = [
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
    fields: [
      { name: "name", type: "text", required: true },
      { name: "slug", type: "text", required: true },
      { name: "description", type: "text" },
      { name: "icon", type: "text" },
      { name: "sort_order", type: "number" },
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
    fields: [
      { name: "title", type: "text", required: true },
      { name: "slug", type: "text", required: true },
      { name: "subtitle", type: "text" },
      { name: "description", type: "editor" },
      { name: "thumbnail", type: "file" },
      {
        name: "category",
        type: "relation",
        options: { collectionId: "categories", maxSelect: 1 } as any,
      },
      {
        name: "instructor",
        type: "relation",
        required: true,
        options: { collectionId: "users", maxSelect: 1 } as any,
      },
      { name: "price", type: "number", required: true },
      { name: "discount_price", type: "number" },
      {
        name: "level",
        type: "select",
        options: { values: ["beginner", "intermediate", "advanced", "all"], maxSelect: 1 } as any,
      },
      { name: "language", type: "text" },
      { name: "duration", type: "number" },
      {
        name: "status",
        type: "select",
        required: true,
        options: { values: ["draft", "published", "archived"], maxSelect: 1 } as any,
      },
      { name: "is_featured", type: "bool" },
      { name: "total_lectures", type: "number" },
      { name: "total_students", type: "number" },
      { name: "average_rating", type: "number" },
      { name: "tags", type: "json" },
      { name: "requirements", type: "editor" },
      { name: "what_you_will_learn", type: "editor" },
      { name: "target_audience", type: "editor" },
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
    fields: [
      {
        name: "course",
        type: "relation",
        required: true,
        options: { collectionId: "courses", maxSelect: 1 } as any,
      },
      { name: "title", type: "text", required: true },
      { name: "sort_order", type: "number", required: true },
      { name: "description", type: "text" },
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
    fields: [
      {
        name: "section",
        type: "relation",
        required: true,
        options: { collectionId: "sections", maxSelect: 1 } as any,
      },
      { name: "title", type: "text", required: true },
      { name: "description", type: "editor" },
      {
        name: "type",
        type: "select",
        required: true,
        options: {
          values: ["video", "article", "quiz", "coding_exercise", "resource"],
          maxSelect: 1,
        } as any,
      },
      { name: "video_url", type: "url" },
      { name: "video_duration", type: "number" },
      { name: "video_qualities", type: "json" },
      { name: "article_content", type: "editor" },
      { name: "resource_file", type: "file" },
      { name: "is_free_preview", type: "bool" },
      { name: "sort_order", type: "number", required: true },
      { name: "is_published", type: "bool" },
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
    fields: [
      {
        name: "student",
        type: "relation",
        required: true,
        options: { collectionId: "users", maxSelect: 1 } as any,
      },
      {
        name: "course",
        type: "relation",
        required: true,
        options: { collectionId: "courses", maxSelect: 1 } as any,
      },
      { name: "progress", type: "number" },
      { name: "completed", type: "bool" },
      { name: "completed_at", type: "date" },
      {
        name: "payment_status",
        type: "select",
        required: true,
        options: {
          values: ["pending", "success", "failed", "refunded"],
          maxSelect: 1,
        } as any,
      },
      { name: "payment_method", type: "text" },
      { name: "payment_details", type: "json" },
      { name: "certificate_url", type: "url" },
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
    fields: [
      {
        name: "student",
        type: "relation",
        required: true,
        options: { collectionId: "users", maxSelect: 1 } as any,
      },
      {
        name: "lecture",
        type: "relation",
        required: true,
        options: { collectionId: "lectures", maxSelect: 1 } as any,
      },
      {
        name: "enrollment",
        type: "relation",
        required: true,
        options: { collectionId: "enrollments", maxSelect: 1 } as any,
      },
      { name: "completed", type: "bool" },
      { name: "watch_time", type: "number" },
      { name: "last_position", type: "number" },
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
    fields: [
      {
        name: "course",
        type: "relation",
        required: true,
        options: { collectionId: "courses", maxSelect: 1 } as any,
      },
      {
        name: "student",
        type: "relation",
        required: true,
        options: { collectionId: "users", maxSelect: 1 } as any,
      },
      { name: "rating", type: "number", required: true },
      { name: "comment", type: "editor" },
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
    fields: [
      {
        name: "student",
        type: "relation",
        required: true,
        options: { collectionId: "users", maxSelect: 1 } as any,
      },
      {
        name: "course",
        type: "relation",
        required: true,
        options: { collectionId: "courses", maxSelect: 1 } as any,
      },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_wishlists_unique ON wishlists (student, course)"],
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
    fields: [
      {
        name: "course",
        type: "relation",
        required: true,
        options: { collectionId: "courses", maxSelect: 1 } as any,
      },
      {
        name: "lecture",
        type: "relation",
        options: { collectionId: "lectures", maxSelect: 1 } as any,
      },
      {
        name: "student",
        type: "relation",
        required: true,
        options: { collectionId: "users", maxSelect: 1 } as any,
      },
      { name: "title", type: "text", required: true },
      { name: "content", type: "editor", required: true },
      { name: "is_resolved", type: "bool" },
    ],
    indexes: ["CREATE INDEX idx_qa_threads_course ON qa_threads (course)"],
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
    fields: [
      {
        name: "thread",
        type: "relation",
        required: true,
        options: { collectionId: "qa_threads", maxSelect: 1 } as any,
      },
      {
        name: "user",
        type: "relation",
        required: true,
        options: { collectionId: "users", maxSelect: 1 } as any,
      },
      { name: "content", type: "editor", required: true },
      { name: "is_instructor_reply", type: "bool" },
    ],
    indexes: ["CREATE INDEX idx_qa_answers_thread ON qa_answers (thread)"],
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
    fields: [
      { name: "code", type: "text", required: true },
      {
        name: "course",
        type: "relation",
        options: { collectionId: "courses", maxSelect: 1 } as any,
      },
      {
        name: "discount_type",
        type: "select",
        required: true,
        options: { values: ["percentage", "fixed"], maxSelect: 1 } as any,
      },
      { name: "discount_value", type: "number", required: true },
      { name: "max_uses", type: "number" },
      { name: "current_uses", type: "number" },
      { name: "expires_at", type: "date" },
      { name: "is_active", type: "bool" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_coupons_code ON coupons (code)"],
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
    fields: [
      {
        name: "student",
        type: "relation",
        required: true,
        options: { collectionId: "users", maxSelect: 1 } as any,
      },
      {
        name: "course",
        type: "relation",
        required: true,
        options: { collectionId: "courses", maxSelect: 1 } as any,
      },
      {
        name: "enrollment",
        type: "relation",
        options: { collectionId: "enrollments", maxSelect: 1 } as any,
      },
      { name: "amount", type: "number", required: true },
      { name: "fee", type: "number" },
      { name: "total", type: "number", required: true },
      { name: "currency", type: "text" },
      { name: "payment_method", type: "text" },
      { name: "midtrans_order_id", type: "text" },
      { name: "midtrans_transaction_id", type: "text" },
      {
        name: "status",
        type: "select",
        required: true,
        options: { values: ["pending", "success", "failed", "refunded"], maxSelect: 1 } as any,
      },
      { name: "payment_details", type: "json" },
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
    fields: [
      {
        name: "student",
        type: "relation",
        required: true,
        options: { collectionId: "users", maxSelect: 1 } as any,
      },
      {
        name: "course",
        type: "relation",
        required: true,
        options: { collectionId: "courses", maxSelect: 1 } as any,
      },
      {
        name: "enrollment",
        type: "relation",
        required: true,
        options: { collectionId: "enrollments", maxSelect: 1 } as any,
      },
      { name: "certificate_number", type: "text", required: true },
      { name: "certificate_url", type: "url" },
      { name: "issued_at", type: "date" },
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
    fields: [
      {
        name: "student",
        type: "relation",
        required: true,
        options: { collectionId: "users", maxSelect: 1 } as any,
      },
      {
        name: "lecture",
        type: "relation",
        required: true,
        options: { collectionId: "lectures", maxSelect: 1 } as any,
      },
      { name: "content", type: "editor", required: true },
      { name: "timestamp", type: "number" },
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
    fields: [
      {
        name: "course",
        type: "relation",
        required: true,
        options: { collectionId: "courses", maxSelect: 1 } as any,
      },
      { name: "title", type: "text", required: true },
      { name: "content", type: "editor", required: true },
    ],
    indexes: ["CREATE INDEX idx_announcements_course ON announcements (course)"],
  },
];

/**
 * Convert our simplified field definitions into the PocketBase 0.38+ fields format.
 * Options are flattened at the top level for each field.
 * Relation collectionId is resolved from name to actual ID.
 */
function buildFields(
  defs: FieldDef[],
  collectionNameToId: Record<string, string>,
): Record<string, any>[] {
  const USER_COLLECTION_ID = "_pb_users_auth_";

  const fields: Record<string, any>[] = [];

  // Tambahkan field buatan user
  for (const f of defs) {
    const field: Record<string, any> = {
      name: f.name,
      type: f.type,
      required: f.required ?? false,
    };

    // Handle relation fields: resolve collectionId from name
    if (f.type === "relation") {
      const opts = (f as any).options || {};
      const collName = opts.collectionId || "";
      if (collName === "users") {
        field.collectionId = USER_COLLECTION_ID;
      } else if (collName) {
        field.collectionId = collectionNameToId[collName] || collName;
      }
      if (opts.maxSelect !== undefined) {
        field.maxSelect = opts.maxSelect;
      }
    }

    // Handle select fields
    if (f.type === "select") {
      const opts = (f as any).options || {};
      if (opts.values) field.values = opts.values;
      if (opts.maxSelect !== undefined) field.maxSelect = opts.maxSelect;
    }

    fields.push(field);
  }

  // Tambahkan created & updated otomatis (PocketBase timestamp fields)
  fields.push({
    name: "created",
    type: "autodate",
    required: false,
    onCreate: true,
    onUpdate: false,
  });
  fields.push({
    name: "updated",
    type: "autodate",
    required: false,
    onCreate: true,
    onUpdate: true,
  });

  return fields;
}

export async function migrateCollections(pb: PocketBase): Promise<void> {
  console.log("\n📦 Migrating collections...");

  const existingCollections = await pb.collections.getFullList();

  // Build a name -> id mapping for all existing collections
  const collectionNameToId: Record<string, string> = {};
  for (const c of existingCollections as any[]) {
    collectionNameToId[c.name] = c.id;
  }
  // Ensure users is known (built-in auth collection)
  collectionNameToId["users"] = "_pb_users_auth_";

  // We need to create collections in dependency order:
  // categories, courses, sections, lectures, enrollments, lecture_progress,
  // reviews, wishlists, qa_threads, qa_answers, coupons, transactions,
  // certificates, notes, announcements
  //
  // After each collection is created, update the name-to-id map
  // so subsequent relation fields can reference it properly.

  for (const col of collections) {
    const existing = existingCollections.find((c: any) => c.name === col.name);
    const fields = buildFields(col.fields, collectionNameToId);

    const payload: Record<string, any> = {
      name: col.name,
      type: col.type,
      fields,
      indexes: col.indexes || [],
      listRule: col.listRule,
      viewRule: col.viewRule,
      createRule: col.createRule,
      updateRule: col.updateRule,
      deleteRule: col.deleteRule,
    };

    if (existing) {
      console.log(`  🔄 Updating collection: ${col.name}`);
      await pb.collections.update(existing.id, payload);
      // Update the map with the actual id
      collectionNameToId[col.name] = existing.id;
    } else {
      console.log(`  ➕ Creating collection: ${col.name}`);
      const result = await pb.collections.create(payload);
      // Update the map with the newly created collection id
      collectionNameToId[col.name] = (result as any).id;
    }
  }

  console.log("✅ All collections migrated!");
}
