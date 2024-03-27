import { PrismaClient } from "@prisma/client";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone';
import { context } from "./context";
import { typeDefs, resolvers } from './schema'
import moment from "moment-timezone";

const prisma = new PrismaClient()

async function startApolloServer() {

    const server = new ApolloServer({
        typeDefs,
        resolvers,
    })

    const { url } = await startStandaloneServer(server, {
        context: context,
        listen: {
            port: parseInt(process.env.PORT || '2000'),
        },
    });
    moment.tz.setDefault('America/Lima')
    console.log(`🚀 Servidor corriendo en: ${url}`)
}

startApolloServer()
    .catch(async (e) => {
        await prisma.$disconnect()
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
