const { PrismaClient } = require("@prisma/client");
import bcryptjs from "bcrypt";

const dummyUser = {
  email: "user@example.com",
  password: "password",
  name: "John Doe",
};

export async function seedDatabase() {
  const prisma = new PrismaClient();

  try {
    // Check if there are any records in the Role table
    const rolesCount = await prisma.role.count();

    if (rolesCount === 0) {
      // Seed the Role table if no records exist
      await prisma.role.create({
        data: {
          label: "Admin",
        },
      });
      await prisma.role.create({
        data: {
          label: "User",
        },
      });
    }

    // Check if there are any records in the User table
    const usersCount = await prisma.user.count();

    if (usersCount === 0) {
      const hashedPassword = bcryptjs.hashSync(dummyUser.password, 10);
      dummyUser.password = hashedPassword;
      // Seed the User table if no records exist
      await prisma.user.create({
        data: dummyUser,
      });
    }

    // Check if there are any records in the Product table
    // const productsCount = await prisma.product.count();

    // if (productsCount === 0) {
    //   // Seed the Product table if no records exist
    //   await prisma.product.create({
    //     data: {
    //       name: "Sample Product",
    //       description: "This is a sample product",
    //       price: 29.99,
    //       stock: 100,
    //       createdByUserId: "1", // Make sure this matches the ID of the user you created
    //     },
    //   });
    // }

    console.log("Seed data successfully inserted.");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
}