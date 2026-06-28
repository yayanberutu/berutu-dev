import { db } from './index';
import { users } from './schema';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config();

async function seed() {
  const email = process.env.ADMIN_EMAIL || 'berutu.dev@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'password123';
  const displayName = 'Yosepri Berutu';

  const existingUser = db.select().from(users).where(eq(users.email, email)).get();

  if (existingUser) {
    console.log(`Admin user with email ${email} already exists.`);
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  db.insert(users).values({
    email,
    passwordHash,
    displayName,
    role: 'admin',
  }).run();

  console.log(`Successfully seeded admin user: ${email}`);
}

seed().catch(console.error);
