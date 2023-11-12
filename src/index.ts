import 'dotenv/config';
import processOtpPipe from './pipelines/otp-pipe';
import DBClient from './db/DBClient';
import processErstePipe from './pipelines/erste-pipe';
import processSzepPipe from './pipelines/szep-pipe';

async function doStuff() {
  console.log('Starting...');
  console.log('Processing OTP...');
  // await processOtpPipe(`${process.cwd()}/inputs/otp.xlsx`);
  console.log('Processing Erste...');
  // await processErstePipe(`${process.cwd()}/inputs/erste.csv`);
  console.log('Processing Szep...');
  await processSzepPipe(`${process.cwd()}/inputs/szep.xlsx`);
  console.log('Done!');
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
