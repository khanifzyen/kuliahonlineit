// API route to view/download certificate as HTML page (printable to PDF)
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";

const PB = process.env.POCKETBASE_URL || "http://localhost:8090";

interface Props { params: Promise<{ certId: string }> }

export async function GET(req: Request, { params }: Props) {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { certId } = await params;

    // Get certificate
    const res = await fetch(`${PB}/api/collections/certificates/records/${certId}?expand=course`, { cache: "no-store" });
    if (!res.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const cert = await res.json();

    // Verify ownership
    if (cert.student !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const course = cert.expand?.course;
    const issuedDate = cert.issued_at
      ? new Date(cert.issued_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
      : new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });

    const html = `<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><title>Sertifikat - ${course?.title || "Kursus"}</title>
<style>
  @page { margin: 0; }
  body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Georgia', serif; }
  .certificate { width: 800px; height: 560px; border: 12px solid #4f46e5; padding: 40px; text-align: center; position: relative; background: #fff; }
  .certificate:before { content: ''; position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px; border: 2px solid #e5e7eb; pointer-events: none; }
  h1 { color: #4f46e5; font-size: 28px; margin-top: 40px; margin-bottom: 10px; }
  .subtitle { color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 4px; margin-bottom: 20px; }
  .name { font-size: 36px; font-weight: bold; color: #111827; margin: 20px 0; border-bottom: 2px solid #4f46e5; display: inline-block; padding-bottom: 10px; }
  .body-text { color: #4b5563; font-size: 16px; line-height: 1.6; max-width: 600px; margin: 20px auto; }
  .course-name { color: #4f46e5; font-weight: bold; font-size: 20px; }
  .footer { position: absolute; bottom: 30px; left: 40px; right: 40px; display: flex; justify-content: space-between; color: #9ca3af; font-size: 12px; }
  .number { color: #9ca3af; font-size: 10px; margin-top: 30px; }
  .badge { font-size: 60px; margin-bottom: 10px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head>
<body>
  <div class="certificate">
    <div class="badge">🎓</div>
    <h1>SERTIFIKAT KELULUSAN</h1>
    <p class="subtitle">KuliahOnlineIT</p>
    <p class="body-text">Diberikan kepada</p>
    <p class="name">${user.name || user.email}</p>
    <p class="body-text">Telah berhasil menyelesaikan kursus</p>
    <p class="course-name">${course?.title || "Kursus"}</p>
    <p class="body-text">pada tanggal ${issuedDate}</p>
    <p class="number">No. ${cert.certificate_number}</p>
    <div class="footer">
      <span>KuliahOnlineIT</span>
      <span>${issuedDate}</span>
    </div>
  </div>
  <script>window.print();</script>
</body></html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
