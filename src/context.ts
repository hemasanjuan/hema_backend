import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

interface Context {
    prisma: PrismaClient
    req: any
}
function context(req: any) {
    return {
        ...req,
        prisma
    }
}

export { Context, context }