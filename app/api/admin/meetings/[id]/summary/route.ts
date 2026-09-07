import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: meetingId } = await params;

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: {
      scans: { where: { meetingId }, select: { type: true } },
    },
  });

  let full = 0, partial = 0, absent = 0;
  for (const s of students) {
    const count = s.scans.length;
    if (count === 2) full++;
    else if (count === 1) partial++;
    else absent++;
  }

  return NextResponse.json({ total: students.length, full, partial, absent });
}