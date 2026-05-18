import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { CourseDetailClient } from "./course-detail-client";



interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCourse(slug: string) {
  try {
    const pbUrl = process.env.POCKETBASE_URL || "http://localhost:8090";
    const res = await fetch(
      `${pbUrl}/api/collections/courses/records?filter=${encodeURIComponent(`slug="${slug}"`)}&expand=category,instructor&perPage=1`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.items?.[0] || null;
  } catch {
    return null;
  }
}

async function getSections(courseId: string) {
  try {
    const pbUrl = process.env.POCKETBASE_URL || "http://localhost:8090";
    const res = await fetch(
      `${pbUrl}/api/collections/sections/records?filter=${encodeURIComponent(`course="${courseId}"`)}&sort=sort_order&expand=lectures`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

async function getLectures(sectionId: string) {
  try {
    const pbUrl = process.env.POCKETBASE_URL || "http://localhost:8090";
    const res = await fetch(
      `${pbUrl}/api/collections/lectures/records?filter=${encodeURIComponent(`section="${sectionId}"`)}&sort=sort_order&perPage=50`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

async function getReviews(courseId: string) {
  try {
    const pbUrl = process.env.POCKETBASE_URL || "http://localhost:8090";
    const res = await fetch(
      `${pbUrl}/api/collections/reviews/records?filter=${encodeURIComponent(`course="${courseId}"`)}&sort=-created&expand=student&perPage=10`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  const [sections, reviews] = await Promise.all([
    getSections(course.id),
    getReviews(course.id),
  ]);

  // Get lectures for each section
  const sectionsWithLectures = await Promise.all(
    sections.map(async (section: any) => {
      const lectures = await getLectures(section.id);
      return { ...section, lectures };
    })
  );

  const pbUrl = process.env.POCKETBASE_URL || "http://localhost:8090";
  const thumbnailUrl = course.thumbnail
    ? `${pbUrl}/api/files/courses/${course.id}/${course.thumbnail}`
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <CourseDetailClient
        course={course}
        thumbnailUrl={thumbnailUrl}
        sections={sectionsWithLectures}
        reviews={reviews}
      />
    </div>
  );
}
