import 'dotenv/config';
import processOtpPipe from './pipelines/otp-pipe';
import DBClient from './db/DBClient';
import processErstePipe from './pipelines/erste-pipe';
import processSzepPipe from './pipelines/szep-pipe';

async function doStuff() {
  // await processOtpPipe(`${process.cwd()}/inputs/otp.xlsx`);
  // await processErstePipe(`${process.cwd()}/inputs/erste.csv`);
  await processSzepPipe(`${process.cwd()}/inputs/szep.xlsx`);
}

doStuff()
  .then(async () => {
    await DBClient.disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await DBClient.disconnect();
    process.exit(1);
  });
