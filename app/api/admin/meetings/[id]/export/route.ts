import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: meetingId } = await params;

  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { name: "asc" },
    select: {
      idNumber: true,
      name: true,
      cohort: true,
      scans: {
        where: { meetingId },
        select: { type: true, timestamp: true }, // ⚠️ check exact field name below
      },
    },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendance");
  sheet.columns = [
    { header: "ID", key: "id", width: 15 },
    { header: "Name", key: "name", width: 30 },
    { header: "Cohort", key: "cohort", width: 10 },
    { header: "Start Scan", key: "start", width: 20 },
    { header: "End Scan", key: "end", width: 20 },
    { header: "Status", key: "status", width: 15 },
    { header: "Missing", key: "missing", width: 15 },
  ];

  for (const s of students) {
    const start = s.scans.find((sc: { type: string }) => sc.type === "START");
    const end = s.scans.find((sc: { type: string }) => sc.type === "END");
    const count = s.scans.length;

    let status = "Absent", missing = "Both";
    if (count === 2) { status = "Full"; missing = "-"; }
    else if (count === 1) { status = "Partial"; missing = start ? "End" : "Start"; }

    sheet.addRow({
      id: s.idNumber,
      name: s.name,
      cohort: s.cohort ?? "-",
      start: start ? start.timestamp.toLocaleString() : "-",
      end: end ? end.timestamp.toLocaleString() : "-",
      status,
      missing,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer as any, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="attendance-${meeting.name}.xlsx"`,
    },
  });
}