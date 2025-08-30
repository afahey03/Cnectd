import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const TEMP_PASSWORD = "TempPass1!";
  const hash = await bcrypt.hash(TEMP_PASSWORD, 10);

  const users = await prisma.user.findMany({
    where: { OR: [{ passwordHash: null }, { passwordHash: "" }] },
    select: { id: true, username: true },
  });

  if (users.length === 0) {
    console.log("No users to backfill.");
    return;
  }

  for (const u of users) {
    await prisma.user.update({
      where: { id: u.id },
      data: { passwordHash: hash },
    });
    console.log(`Backfilled ${u.username}`);
  }
}

main().finally(() => prisma.$disconnect());
