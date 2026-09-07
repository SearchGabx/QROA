import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const workbook = new ExcelJS.Workbook();
  // @ts-expect-error - exceljs's bundled @types/node Buffer type conflicts
  // with the project's Buffer type; both are the same bytes at runtime.
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];

  let processed = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);

    const cohortRaw = row.getCell(1).value;
    const idRaw = row.getCell(2).value;
    const nameRaw = row.getCell(3).value;

    const cohort = cohortRaw ? String(cohortRaw).trim() : "";
    const idNumber = idRaw ? String(idRaw).trim() : "";
    const name = nameRaw ? String(nameRaw).trim() : "";

    // Skip blank rows and the header row
    if (!idNumber || !name || idNumber === "ID") {
      skipped++;
      continue;
    }

    try {
      const hashedPassword = await bcrypt.hash(idNumber, 10);

      await prisma.user.upsert({
        where: { idNumber },
        update: { name, cohort },
        create: {
          idNumber,
          password: hashedPassword,
          name,
          cohort,
          role: "STUDENT",
        },
      });

      processed++;
    } catch (err) {
      errors.push(`${idNumber}: ${(err as Error).message}`);
    }
  }

  return NextResponse.json({ processed, skipped, errors });
}