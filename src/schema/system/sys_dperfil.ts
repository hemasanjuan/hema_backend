
import { context, Context } from '../../context'
import { getUserId } from "../../utils";


const tipeDefs = `#graphql

extend type Query {
    getAllDetallePerfil: [sys_dperfil!]!
    getDetallePerfilOne(id: Int!): sys_dperfil
}

extend type Mutation {
    createDPerfil(dperf_menu:String!, dperf_perfil:Int!, dperf_permisos: String): sys_dperfil
    updateDPerfil(dperf_id: Int!, dperf_menu:String!, dperf_perfil:Int!, dperf_permisos: String): sys_dperfil
}

type sys_dperfil {
    dperf_id: Int!
    dperf_menu: String!
    dperf_perfil: Int!
    dperf_permisos: String
    sub_menu: sys_submenu
    perfil: sys_perfil!
}

`

const resolvers = {
    Query: {
        getAllDetallePerfil: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_dperfil.findMany()
        },
        getDetallePerfilOne: async  (_parent: any, _args: { id: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_dperfil.findUnique({
                where: {
                    dperf_id: _args.id
                }
            })
        }
    },
    Mutation: {
        createDPerfil: async (_parent: any, _args: { dperf_menu: string, dperf_perfil: number, dperf_permisos: string }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_dperfil.create({
                data: {
                    dperf_menu: _args.dperf_menu,
                    dperf_perfil: _args.dperf_perfil,
                    dperf_permisos: _args?.dperf_permisos || ""
                }
            })
        },
        updateDPerfil: async (_parent: any, _args: { dperf_id: number, dperf_menu: string, dperf_perfil: number, dperf_permisos: string }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_dperfil.update({
                where: {
                    dperf_id: _args.dperf_id
                },
                data: {
                    dperf_menu: _args.dperf_menu,
                    dperf_perfil: _args.dperf_perfil,
                    dperf_permisos: _args?.dperf_permisos || ""
                }
            })
        }
    },
    sys_dperfil: {
        sub_menu: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_dperfil.findUnique({
                where: { dperf_id: _parent.dperf_id }
            }).sys_submenu()
        },
        perfil: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_dperfil.findUnique({
                where: { dperf_id: _parent.dperf_id }
            }).sys_perfil()
        }
    }
}

export { tipeDefs as sysDperfilTipeDef, resolvers as sysDperfilResolv }