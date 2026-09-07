import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { idNumber, meetingId, type } = body;

  if (!idNumber || !meetingId || !type) {
    return NextResponse.json(
      { error: "idNumber, meetingId, and type are required" },
      { status: 400 }
    );
  }

  if (type !== "START" && type !== "END") {
    return NextResponse.json({ error: "Invalid scan type" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { idNumber } });

  if (!user) {
    return NextResponse.json(
      { error: `No student found with ID ${idNumber}` },
      { status: 404 }
    );
  }

  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
  });

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  try {
    await prisma.scan.create({
      data: {
        userId: user.id,
        meetingId,
        type,
      },
    });

    return NextResponse.json({ name: user.name, idNumber: user.idNumber });
} catch (err: unknown) {
  const isDuplicateError =
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === "P2002";

  if (isDuplicateError) {
    return NextResponse.json(
      {
        error: `${user.name} already has a ${type} scan for this meeting`,
        duplicate: true,
      },
      { status: 409 }
    );
  }

  return NextResponse.json(
    { error: "Failed to record scan" },
    { status: 500 }
  );
}
}