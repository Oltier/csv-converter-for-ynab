"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../generated/client");
class DBClient {
    prisma;
    static instance;
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    static isInitialized() {
        return !!DBClient.instance;
    }
    static disconnect() {
        if (DBClient.instance) {
            return DBClient.instance.prisma.$disconnect();
        }
        return Promise.resolve();
    }
    static getInstance() {
        if (!DBClient.instance) {
            DBClient.instance = new DBClient();
        }
        return DBClient.instance.prisma;
    }
}
exports.default = DBClient;
