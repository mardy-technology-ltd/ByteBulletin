import { prisma } from "../lib/db/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const email = "admin@bytebulletin.com";
  const password = "password123";
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  const hashedPassword = await bcrypt.hash(password, 10);

  if (existingUser) {
    await prisma.user.update({
      where: { email },
      data: { 
        role: "ADMIN",
        password: hashedPassword 
      }
    });
    console.log(`User ${email} is now an ADMIN and password has been reset.`);
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name: "Admin",
        email,
        password: hashedPassword,
        role: "ADMIN",
        preferences: {
          create: {}
        }
      }
    });
    console.log(`Created new ADMIN user: ${email} / ${password}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
