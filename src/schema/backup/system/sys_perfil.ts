
import { context, Context } from '../../context'
import { getUserId } from "../../utils";


const tipeDefs = `#graphql

extend type Query {
    getAllPerfil: [sys_perfil!]!
    getOnePerfil(perfil_id: Int!): sys_perfil
}

extend type Mutation {
    createPerfil(perf_desc: String!): sys_perfil
    updatePerfil(perf_id: Int!,perf_desc: String!): sys_perfil
}

type sys_perfil {
    perf_id: Int!
    perf_desc: String!
    sub_perfil: [sys_dperfil!]!
}

`

const resolvers = {
    Query: {
        getAllPerfil: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_perfil.findMany()
        },
        getOnePerfil: async (_parent: any, _args: { perf_id: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_perfil.findUnique({
                where: {
                    perf_id: _args.perf_id
                }
            })
        }
    },
    Mutation: {
        createPerfil: async (_parent: any, args: { perf_desc: string }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_perfil.create({
                data: {
                    perf_desc: args.perf_desc
                }
            })
        },
        updatePerfil: async (_parent: any, args: { perfil_id: number, perf_desc: string }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_perfil.update({
                where: {
                    perf_id: args.perfil_id
                },
                data: {
                    perf_desc: args.perf_desc
                }
            })
        }
    },
    sys_perfil: {
        sub_perfil: async (parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_dperfil.findMany({
                where: {
                    dperf_perfil: parent.perf_id
                }
            })
        }
    }
}

export { tipeDefs as sysPerfilTipeDef, resolvers as sysPerfilResolv }