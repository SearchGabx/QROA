import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminIdNumber = "1042255719";
  const adminName = "Admin";

  const hashedPassword = await bcrypt.hash(adminIdNumber, 10);

  const admin = await prisma.user.upsert({
    where: { idNumber: adminIdNumber },
    update: {},
    create: {
      idNumber: adminIdNumber,
      password: hashedPassword,
      name: adminName,
      role: "ADMIN",
    },
  });

  console.log("Admin user ready:", {
    idNumber: admin.idNumber,
    name: admin.name,
    role: admin.role,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });