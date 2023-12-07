// seed.ts
import { DataSource } from 'typeorm';
import { createUser } from './user.factory';
import { createMentor } from './mentor.factory';
import { User } from '../modules/user/entities/user.entity';
import { Mentor } from '../modules/mentor/entities/mentor.entity';

async function connectToDatabase() {
  return new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'mentor_user',
    password: 'mentor_password',
    database: 'mentor_db',
    synchronize: true,
    logging: true,
    entities: [User],
  }).initialize();
}
async function seedDatabase() {
  const connection = await connectToDatabase();
  // Seed Users
  for (let i = 0; i < 5; i++) {
    const user = createUser();
    await connection.manager.save(user);
  }

  // Seed Mentor and Reviews
  // const users = await connection.manager.find(User);
  // for (const user of users) {
  //   const mentor = createMentor(user);
  //   await connection.manager.save(mentor);
  //   //
  //   // for (let j = 0; j < 3; j++) { // For example, each mentor has 3 reviews
  //   //     const review = createReview(Mentor);
  //   //     await connection.manager.save(review);
  //   // }
  // }

  console.log('Data seeding completed successfully.');
  await connection.destroy();
}

seedDatabase().catch((error) => {
  console.error('Error during Data Seeding:', error);
});
