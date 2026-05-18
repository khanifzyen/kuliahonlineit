import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { Navbar } from "@/components/navbar";
import { CheckoutClient } from "./checkout-client";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

async function getCourse(courseId: string) {
  try {
    const pbUrl = process.env.POCKETBASE_URL || "http://localhost:8090";
    const res = await fetch(
      `${pbUrl}/api/collections/courses/records/${courseId}?expand=instructor`,
      { cache: "no-store" }
    );
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

export default async function CheckoutPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/checkout/${(await params).courseId}`);
  }

  const { courseId } = await params;
  const userId = (session.user as any).id || (session.user as any).pocketbaseId;

  const course = await getCourse(courseId);
  if (!course) notFound();

  // Check if already enrolled
  const enrollment = await getEnrollment(userId, courseId);
  if (enrollment) {
    redirect(`/my-learning/${courseId}`);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <CheckoutClient course={course} userId={userId} />
    </div>
  );
}
