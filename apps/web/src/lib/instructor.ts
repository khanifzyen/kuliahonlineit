// Helper untuk mengecek apakah user adalah instructor
// Sederhana: user dengan role 'instructor' atau 'admin'

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://localhost:8090";

export async function checkInstructor(userId: string): Promise<boolean> {
  try {
    const res = await fetch(`${POCKETBASE_URL}/api/collections/users/records/${userId}`, {
      cache: "no-store",
    });
    if (!res.ok) return false;
    const user = await res.json();
    return user.role === "instructor" || user.role === "admin";
  } catch {
    return false;
  }
}

export function formatCurrency(amount: number): string {
  return `Rp${(amount || 0).toLocaleString("id-ID")}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getThumbnailUrl(collection: string, recordId: string, filename: string | null): string | null {
  if (!filename) return null;
  return `${POCKETBASE_URL}/api/files/${collection}/${recordId}/${filename}`;
}
