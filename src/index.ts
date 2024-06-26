import 'dotenv/config';
import processOtpPipe from './pipelines/otp-pipe';
import DBClient from './db/DBClient';
import processErstePipe from './pipelines/erste-pipe';
import processSzepPipe from './pipelines/szep-pipe';
import processErsteJsonPipe from './pipelines/erste-json-pipe';
import fs from 'fs';

async function doStuff() {
  console.log('Starting...');

  // If folder process.cwd()/outputs does not exist, create it
  if (!fs.existsSync(`${process.cwd()}/outputs`)) {
    fs.mkdirSync(`${process.cwd()}/outputs`);
  }

  await Promise.all([
    processFile(`${process.cwd()}/inputs/otp.xlsx`, processOtpPipe),
    processFile(`${process.cwd()}/inputs/erste.csv`, processErstePipe),
    processFile(`${process.cwd()}/inputs/szep.xlsx`, processSzepPipe),
    processFile(`${process.cwd()}/inputs/erste.json`, processErsteJsonPipe),
  ]);
  console.log('Done!');
}

async function processFile(filePath: string, processor: (path: string) => Promise<void>): Promise<void> {
  try {
    const filePathArr = filePath.split('/');
    console.log(`Processing ${filePathArr[filePathArr.length - 1]}...`);
    await processor(filePath);
    console.log(`Done processing ${filePathArr[filePathArr.length - 1]}.`);
  } catch (e) {
    console.error(`error processing ${filePath}, skipping...`, e);
    return Promise.resolve();
  }
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
