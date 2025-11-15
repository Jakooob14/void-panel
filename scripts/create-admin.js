import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !email || !password) {
    console.log('Admin seed skipped – ENV variables missing.');
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { username },
  });

  if (existing) {
    console.log('Admin user already exists. Skipping creation.');
    return;
  }

  const hash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      username,
      email,
      password: hash,
      permissions: ['manage:users_storage', 'view:admin_panel'],
    },
  });

  console.log('Admin user created successfully!');
}

main()
  .catch((err) => {
    console.error('Failed to create admin:', err);
  })
  .finally(() => prisma.$disconnect());
