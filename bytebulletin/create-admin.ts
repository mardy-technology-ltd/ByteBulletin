import { prisma } from "./lib/db/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const email = "admin@bytebulletin.com";
  const password = "admin123";
  
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      email,
      name: "Developer Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`Admin user created!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Role: ${admin.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
