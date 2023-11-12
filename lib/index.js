"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const otp_pipe_1 = __importDefault(require("./pipelines/otp-pipe"));
const DBClient_1 = __importDefault(require("./db/DBClient"));
const erste_pipe_1 = __importDefault(require("./pipelines/erste-pipe"));
const szep_pipe_1 = __importDefault(require("./pipelines/szep-pipe"));
async function doStuff() {
    console.log('Starting...');
    console.log('Processing OTP...');
    await (0, otp_pipe_1.default)(`${process.cwd()}/inputs/otp.xlsx`);
    console.log('Processing Erste...');
    await (0, erste_pipe_1.default)(`${process.cwd()}/inputs/erste.csv`);
    console.log('Processing Szep...');
    await (0, szep_pipe_1.default)(`${process.cwd()}/inputs/szep.xlsx`);
    console.log('Done!');
}
doStuff()
    .then(async () => {
    await DBClient_1.default.disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await DBClient_1.default.disconnect();
    process.exit(1);
});
