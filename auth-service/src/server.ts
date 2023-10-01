import { PrismaClient } from "@prisma/client";
import app from "./app";
import { seedDatabase } from "../prisma/seed";

const prisma = new PrismaClient();

seedDatabase().then(() => {
  console.log("Seeder running");
  app.listen(process.env.PORT, () =>
    console.log("Started server on port", process.env.PORT)
  );
});
