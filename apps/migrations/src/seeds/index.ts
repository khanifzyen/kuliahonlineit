// ============================================
// KuliahOnlineIT - Seed Data
// ============================================
// Data awal untuk development

import type PocketBase from "pocketbase";

export async function seedData(pb: PocketBase): Promise<void> {
  console.log("\n🌱 Seeding data...");

  // ========================================
  // 1. Categories
  // ========================================
  const existingCategories = await pb.collection("categories").getFullList();
  let categoryMap: Record<string, string> = {};

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
      const record = await pb.collection("categories").create(cat);
      categoryMap[cat.slug] = record.id;
      console.log(`  ➕ Category: ${cat.name}`);
    }
  } else {
    for (const c of existingCategories) {
      categoryMap[(c as any).slug] = c.id;
    }
    console.log(`  ✅ Categories already exist (${existingCategories.length})`);
  }

  // ========================================
  // 2. Instructor User
  // ========================================
  let instructorId: string | null = null;
  const existingUsers = await pb.collection("users").getFullList();

  // Cari instructor yang sudah ada
  for (const u of existingUsers) {
    if ((u as any).name === "Instructor KuliahOnlineIT") {
      instructorId = u.id;
      break;
    }
  }

  if (!instructorId) {
    try {
      const instructor = await pb.collection("users").create({
        email: "instructor@kuliahonlineit.com",
        password: "instructor123",
        passwordConfirm: "instructor123",
        name: "Instructor KuliahOnlineIT",
        verified: true,
      });
      instructorId = instructor.id;
      console.log(`  ➕ Instructor: ${(instructor as any).name} (${instructor.id})`);
    } catch (err: any) {
      // Mungkin sudah ada
      const users = await pb.collection("users").getFullList();
      for (const u of users) {
        if ((u as any).email === "instructor@kuliahonlineit.com") {
          instructorId = u.id;
          break;
        }
      }
      if (instructorId) {
        console.log(`  ✅ Using existing instructor: ${instructorId}`);
      } else {
        console.log(`  ⚠️ Could not create instructor, using superuser`);
        // Fallback: use superuser
        const superusers = await pb.collection("_superusers").getFullList();
        if (superusers.length > 0) {
          instructorId = superusers[0].id;
        }
      }
    }
  } else {
    console.log(`  ✅ Instructor already exists: ${instructorId}`);
  }

  if (!instructorId) {
    console.log("  ❌ No instructor available, skipping course seed");
    return;
  }

  // ========================================
  // 3. Courses, Sections, Lectures
  // ========================================
  const existingCourses = await pb.collection("courses").getFullList();

  const coursesData = [
    {
      title: "Full-Stack Web Development dengan Next.js",
      slug: "fullstack-nextjs",
      subtitle: "Bangun aplikasi web modern dari nol sampai production dengan Next.js 16",
      description: "<p>Kursus ini akan membawa Anda dari pemula menjadi full-stack developer dengan Next.js 16. Anda akan belajar App Router, Server Components, API routes, autentikasi, database, dan deployment.</p><p>Setiap materi disertai studi kasus nyata dan praktik langsung.</p>",
      categorySlug: "web-development",
      price: 250000,
      discount_price: 149000,
      level: "beginner",
      language: "Indonesia",
      status: "published",
      is_featured: true,
      what_you_will_learn: "<ul><li>Memahami arsitektur Next.js 16</li><li>Membuat halaman dengan App Router</li><li>Integrasi database dengan PocketBase</li><li>Autentikasi dan proteksi rute</li><li>Deploy aplikasi ke Vercel</li></ul>",
      requirements: "<p>Pengetahuan dasar HTML, CSS, dan JavaScript. Tidak perlu pengalaman dengan React atau Next.js.</p>",
      target_audience: "<p>Pemula yang ingin belajar web development modern. Developer yang ingin migrasi ke Next.js.</p>",
      sections: [
        {
          title: "Pengenalan Next.js",
          sort_order: 1,
          lectures: [
            {
              title: "Apa itu Next.js?",
              type: "video",
              video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
              video_duration: 480,
              is_free_preview: true,
              sort_order: 1,
              is_published: true,
              description: "Pengenalan tentang Next.js, kelebihannya, dan perbandingannya dengan framework lain.",
            },
            {
              title: "Setup Project Pertama",
              type: "video",
              video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
              video_duration: 600,
              is_free_preview: false,
              sort_order: 2,
              is_published: true,
              description: "Langkah-langkah membuat project Next.js baru dari awal.",
            },
            {
              title: "Struktur Folder dan File",
              type: "article",
              article_content: "<h2>Memahami Struktur Project Next.js</h2><p>Setelah membuat project Next.js, Anda akan melihat struktur folder seperti ini:</p><pre><code>my-app/\\n├── app/\\n│   ├── layout.tsx\\n│   ├── page.tsx\\n│   └── globals.css\\n├── public/\\n├── package.json\\n└── next.config.ts</code></pre><p>Mari kita bahas satu per satu.</p><h3>app/</h3><p>Folder ini adalah inti dari Next.js App Router. Setiap folder di dalamnya merepresentasikan rute URL.</p>",
              sort_order: 3,
              is_published: true,
            },
            {
              title: "Server Components vs Client Components",
              type: "video",
              video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
              video_duration: 720,
              is_free_preview: false,
              sort_order: 4,
              is_published: true,
              description: "Memahami perbedaan Server Components dan Client Components di Next.js.",
            },
          ],
        },
        {
          title: "Routing & Layout",
          sort_order: 2,
          lectures: [
            {
              title: "App Router Fundamentals",
              type: "video",
              video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
              video_duration: 540,
              is_free_preview: false,
              sort_order: 1,
              is_published: true,
              description: "Dasar-dasar App Router dan perbedaannya dengan Pages Router.",
            },
            {
              title: "Dynamic Routes",
              type: "video",
              video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
              video_duration: 660,
              is_free_preview: false,
              sort_order: 2,
              is_published: true,
              description: "Membuat halaman dinamis dengan parameter rute.",
            },
          ],
        },
        {
          title: "Database & Autentikasi",
          sort_order: 3,
          lectures: [
            {
              title: "Integrasi PocketBase",
              type: "video",
              video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
              video_duration: 900,
              is_free_preview: false,
              sort_order: 1,
              is_published: true,
              description: "Menghubungkan Next.js dengan PocketBase sebagai backend.",
            },
            {
              title: "Implementasi Login & Register",
              type: "article",
              article_content: "<h2>Membuat Sistem Autentikasi</h2><p>Dalam bab ini kita akan membuat sistem login dan register menggunakan PocketBase Auth.</p><h3>Flow Autentikasi</h3><ol><li>User mengisi form register</li><li>Data dikirim ke PocketBase via SDK</li><li>PocketBase mengirim email verifikasi</li><li>User verifikasi email dan login</li></ol><p>Dengan PocketBase, kita tidak perlu menulis backend auth sendiri.</p>",
              sort_order: 2,
              is_published: true,
            },
          ],
        },
      ],
    },
    {
      title: "UI/UX Design Fundamentals",
      slug: "uiux-design-fundamentals",
      subtitle: "Pelajari prinsip desain antarmuka dan pengalaman pengguna dari dasar",
      description: "<p>Kursus ini cocok untuk pemula yang ingin memulai karir di bidang UI/UX Design. Anda akan belajar prinsip desain, tools, dan workflow lengkap dari riset hingga prototyping.</p>",
      categorySlug: "ui-ux-design",
      price: 180000,
      discount_price: null,
      level: "beginner",
      language: "Indonesia",
      status: "published",
      is_featured: true,
      what_you_will_learn: "<ul><li>Prinsip-prinsip desain visual</li><li>Teori warna dan tipografi</li><li>Membuat wireframe dan prototype</li><li>User research dasar</li><li>Menggunakan Figma untuk desain UI</li></ul>",
      requirements: "<p>Tidak ada prasyarat khusus. Kursus ini untuk pemula absolut.</p>",
      target_audience: "<p>Pemula yang ingin belajar UI/UX Design. Developer yang ingin memahami dasar desain.</p>",
      sections: [
        {
          title: "Dasar-dasar Desain",
          sort_order: 1,
          lectures: [
            {
              title: "Apa itu UI/UX Design?",
              type: "video",
              video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
              video_duration: 420,
              is_free_preview: true,
              sort_order: 1,
              is_published: true,
              description: "Pengertian UI dan UX, perbedaannya, dan mengapa keduanya penting.",
            },
            {
              title: "Prinsip Gestalt dalam Desain",
              type: "video",
              video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
              video_duration: 780,
              is_free_preview: false,
              sort_order: 2,
              is_published: true,
              description: "Memahami prinsip Gestalt dan penerapannya dalam desain antarmuka.",
            },
            {
              title: "Teori Warna",
              type: "article",
              article_content: "<h2>Memahami Teori Warna</h2><p>Warna adalah elemen paling penting dalam desain. Warna yang tepat bisa menyampaikan emosi dan memperkuat brand.</p><h3>Color Wheel</h3><p>Color wheel atau roda warna adalah alat bantu untuk memahami hubungan antar warna.</p><ul><li><strong>Warna Primer:</strong> Merah, Kuning, Biru</li><li><strong>Warna Sekunder:</strong> Hijau, Oranye, Ungu</li><li><strong>Warna Tersier:</strong> Campuran primer dan sekunder</li></ul><h3>Psikologi Warna</h3><p>Setiap warna memiliki makna psikologis. Biru melambangkan kepercayaan, hijau melambangkan pertumbuhan, merah melambangkan energi.</p>",
              sort_order: 3,
              is_published: true,
            },
            {
              title: "Tipografi untuk Antarmuka",
              type: "video",
              video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              video_duration: 600,
              is_free_preview: false,
              sort_order: 4,
              is_published: true,
              description: "Memilih font yang tepat, hierarchy tipografi, dan tips readability.",
            },
          ],
        },
        {
          title: "Figma & Prototyping",
          sort_order: 2,
          lectures: [
            {
              title: "Mengenal Figma",
              type: "video",
              video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
              video_duration: 540,
              is_free_preview: false,
              sort_order: 1,
              is_published: true,
              description: "Tour antarmuka Figma, tools dasar, dan shortcut penting.",
            },
            {
              title: "Membuat Wireframe Halaman Landing",
              type: "video",
              video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
              video_duration: 840,
              is_free_preview: false,
              sort_order: 2,
              is_published: true,
              description: "Praktik membuat wireframe untuk halaman landing product.",
            },
          ],
        },
        {
          title: "User Research",
          sort_order: 3,
          lectures: [
            {
              title: "Metode User Research",
              type: "article",
              article_content: "<h2>Metode User Research untuk Pemula</h2><p>User research adalah fondasi dari desain yang baik. Tanpa riset, kita hanya menebak kebutuhan user.</p><h3>Metode-metode Riset</h3><ol><li><strong>User Interview</strong> — Wawancara satu-satu dengan user target</li><li><strong>Survey</strong> — Kuesioner untuk data kuantitatif</li><li><strong>Usability Testing</strong> — Mengamati user menggunakan produk</li><li><strong>A/B Testing</strong> — Membandingkan dua versi desain</li></ol>",
              sort_order: 1,
              is_published: true,
            },
            {
              title: "Membuat User Persona",
              type: "video",
              video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
              video_duration: 660,
              is_free_preview: false,
              sort_order: 2,
              is_published: true,
              description: "Belajar membuat user persona dari data riset yang sudah dikumpulkan.",
            },
          ],
        },
      ],
    },
  ];

  for (const courseData of coursesData) {
    // Cek apakah kursus sudah ada
    const existing = existingCourses.find((c: any) => c.slug === courseData.slug);
    if (existing) {
      console.log(`  ✅ Course already exists: ${courseData.title}`);
      continue;
    }

    const categoryId = categoryMap[courseData.categorySlug];
    if (!categoryId) {
      console.log(`  ⚠️ Category not found for: ${courseData.categorySlug}, skipping`);
      continue;
    }

    // Buat course
    const { sections: sectionsData, ...courseFields } = courseData;
    const course = await pb.collection("courses").create({
      ...courseFields,
      category: categoryId,
      instructor: instructorId,
      total_lectures: sectionsData.reduce((sum, s) => sum + s.lectures.length, 0),
    } as any);
    console.log(`  ➕ Course: ${courseData.title} (${course.id})`);

    // Buat sections & lectures
    for (const sectionData of sectionsData) {
      const { lectures: lecturesData, ...sectionFields } = sectionData;
      const section = await pb.collection("sections").create({
        ...sectionFields,
        course: course.id,
      } as any);
      console.log(`    ➕ Section: ${sectionData.title}`);

      for (const lectureData of lecturesData) {
        await pb.collection("lectures").create({
          ...lectureData,
          section: section.id,
        } as any);
        console.log(`      ➕ Lecture: ${lectureData.title}`);
      }
    }
  }

  console.log("✅ Seed data completed!");
}
