import 'dotenv/config';
import processOtpPipe from './pipelines/otp-pipe';
import DBClient from './db/DBClient';
import processErstePipe from './pipelines/erste-pipe';

async function doStuff() {
  await Promise.all([
    processOtpPipe(`${__dirname}/examples/input/otp.xlsx`),
    // processErstePipe(`${__dirname}/examples/input/erste.csv`)
  ]);
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
