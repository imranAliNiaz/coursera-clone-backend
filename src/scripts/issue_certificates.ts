import { prisma } from "../config/prisma";
import { issueCertificateForEnrollment } from "../services/certificate.service";

const run = async () => {
  const completed = await prisma.enrollment.findMany({
    where: { completed: true },
    select: { id: true },
  });

  for (const e of completed) {
    try {
      await issueCertificateForEnrollment(e.id);
    } catch (err) {
      console.error(`Failed to issue for enrollment ${e.id}`, err);
    }
  }
};

run()
  .then(() => {
    console.log("Certificate issuance completed");
    return prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
