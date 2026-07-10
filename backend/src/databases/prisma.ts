import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient({
    datasourceUrl: (process.env.DIRECT_URL || process.env.DATABASE_URL) as string,
});

export default prisma;
