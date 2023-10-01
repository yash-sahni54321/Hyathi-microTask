import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../prisma/seed";
import app from "./app";

const prisma = new PrismaClient();

seedDatabase().then(async () => {
  console.log("Seeder is running");
  app.listen(process.env.PORT, () =>
    console.log("Started server on port", process.env.PORT)
  );
});
