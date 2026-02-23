import { prisma } from "../config/prisma";

const cleanup = async () => {
  console.log("Cleaning up all certificates to allow regeneration...");
  const deleted = await prisma.certificate.deleteMany({});
  console.log(`Deleted ${deleted.count} certificates.`);
};

cleanup()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
