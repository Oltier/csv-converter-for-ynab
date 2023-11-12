import 'dotenv/config';
import processOtpPipe from './pipelines/otp-pipe';
import DBClient from './db/DBClient';

async function doStuff() {
  await processOtpPipe(`${__dirname}/examples/input/otp.xlsx`);
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
