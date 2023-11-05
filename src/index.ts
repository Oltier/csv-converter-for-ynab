import 'dotenv/config';
import processOtpPipe from './pipelines/otp-pipe';
import { PrismaClient } from './generated/client';

const prisma = new PrismaClient();

async function doStuff() {
  await processOtpPipe(`${__dirname}/examples/input/otp.xlsx`, prisma);
}

doStuff()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
