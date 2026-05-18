import { redirect, notFound } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { Navbar } from "@/components/navbar";
import { CoursePlayerClient } from "./course-player-client";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

async function getCourse(courseId: string) {
  try {
    const pbUrl = process.env.POCKETBASE_URL || "http://localhost:8090";
    const res = await fetch(`${pbUrl}/api/collections/courses/records/${courseId}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getEnrollment(userId: string, courseId: string) {
  try {
    const pbUrl = process.env.POCKETBASE_URL || "http://localhost:8090";
    const res = await fetch(
      `${pbUrl}/api/collections/enrollments/records?filter=${encodeURIComponent(`student="${userId}" && course="${courseId}"`)}&perPage=1`,
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
      `${pbUrl}/api/collections/sections/records?filter=${encodeURIComponent(`course="${courseId}"`)}&sort=sort_order&perPage=20`,
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

async function getLectureProgress(userId: string, courseId: string) {
  try {
    const pbUrl = process.env.POCKETBASE_URL || "http://localhost:8090";
    // Get enrollment first
    const enrollment = await getEnrollment(userId, courseId);
    if (!enrollment) return { enrollment: null, progress: {} };
    // Get all progress records for this enrollment
    const res = await fetch(
      `${pbUrl}/api/collections/lecture_progress/records?filter=${encodeURIComponent(`enrollment="${enrollment.id}"`)}&perPage=100`,
      { cache: "no-store" }
    );
    if (!res.ok) return { enrollment, progress: {} };
    const data = await res.json();
    const progressMap: Record<string, any> = {};
    for (const item of data.items || []) {
      progressMap[item.lecture] = item;
    }
    return { enrollment, progress: progressMap };
  } catch {
    return { enrollment: null, progress: {} };
  }
}

export default async function CoursePlayerPage({ params }: PageProps) {
  const user = await getServerUser();

  if (!user) {
    redirect("/auth/login?callbackUrl=/my-learning");
  }

  const { courseId } = await params;
  const userId = user.id;

  const course = await getCourse(courseId);
  if (!course) notFound();

  const { enrollment, progress } = await getLectureProgress(userId, courseId);
  if (!enrollment) {
    redirect(`/courses/${course.slug || course.id}`);
  }

  const sections = await getSections(courseId);
  const sectionsWithLectures = await Promise.all(
    sections.map(async (section: any) => {
      const lectures = await getLectures(section.id);
      return { ...section, lectures };
    })
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <Navbar user={user} />
      <CoursePlayerClient
        course={course}
        sections={sectionsWithLectures}
        progress={progress}
        enrollment={enrollment}
      />
    </div>
  );
}
