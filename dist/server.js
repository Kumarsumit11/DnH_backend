"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const prisma_1 = require("./config/prisma");
async function bootstrap() {
    try {
        await prisma_1.prisma.$connect();
        console.log('Database connected');
        app_1.default.listen(env_1.env.PORT, () => {
            console.log(`DNH backend running on port ${env_1.env.PORT} [${env_1.env.NODE_ENV}]`);
        });
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
bootstrap();
