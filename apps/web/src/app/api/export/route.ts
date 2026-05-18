// API route to download course stats as CSV
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { exportCourseStatsCSV } from "@/lib/analytics";

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const csv = await exportCourseStatsCSV(user.id);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=course-stats.csv",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
