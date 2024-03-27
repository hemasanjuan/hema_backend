
import { context, Context } from '../../context'
import { getUserId } from "../../utils";


const tipeDefs = `#graphql

    extend type Query {
        getAllSysControl: [sys_control!]!
        getOneSysControl(cont_id: Int,cont_acceso: Int): [sys_control]
    }

    extend type Mutation {
        createSysControl(data: CreateSysControlInput!): sys_control
        updateSysControl(cont_id: Int!, data: UpdateSysControlInput!): sys_control
    }

    input CreateSysControlInput {
        cont_sucursal: Int!
        cont_acceso: Int!
        cont_perfil: Int!
    }

    input UpdateSysControlInput {
        cont_sucursal: Int
        cont_acceso: Int
        cont_perfil: Int
    }

    type sys_control {
        cont_id: Int!
        cont_sucursal: Int!
        cont_acceso: Int!
        cont_perfil: Int!
        cont_st: Boolean
        sucursal: TabSucursal
        acceso: sys_acceso
        perfil: sys_perfil
    }

`

const resolvers = {
    Query: {
        getAllSysControl: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_control.findMany()
        },
        getOneSysControl: async (_parent: any, _args: { cont_id: number, cont_acceso: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_control.findMany({
                where: {
                    OR: [
                        { cont_id: _args.cont_id },
                        { cont_acceso: _args.cont_acceso }
                    ]
                }
            })
        },
    },
    Mutation: {
        createSysControl: async (_parent: any, args: { data: { cont_sucursal: number, cont_acceso: number, cont_perfil: number } }, context: Context) => {
            const userId = getUserId(context)
            const verificaSucursal = await context.prisma.tabSucursal.findUnique({
                where: {
                    IdSucursal: args.data.cont_sucursal
                }
            })

            const verificaAcceso = await context.prisma.sys_acceso.findUnique({
                where: {
                    acc_id: args.data.cont_acceso
                }
            })

            const verificaPerfil = await context.prisma.sys_perfil.findUnique({
                where: {
                    perf_id: args.data.cont_perfil
                }
            })

            if (verificaSucursal && verificaAcceso && verificaPerfil) {
                return context.prisma.sys_control.create({
                    data: {
                        cont_sucursal: args.data.cont_sucursal,
                        cont_acceso: args.data.cont_acceso,
                        cont_perfil: args.data.cont_perfil
                    }
                })
            } else {
                throw new Error('No existe la sucursal, acceso o perfil')
            }
        },
        updateSysControl: async (_parent: any, args: { cont_id: number, data: { cont_sucursal: number, cont_acceso: number, cont_perfil: number } }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_control.update({
                where: {
                    cont_id: args.cont_id
                },
                data: {
                    cont_sucursal: args.data.cont_sucursal,
                    cont_acceso: args.data.cont_acceso,
                    cont_perfil: args.data.cont_perfil,
                }
            })
        },
    },
    sys_control: {
        sucursal: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_control.findUnique({
                where: {
                    cont_id: _parent.cont_id
                }
            }).TabSucursal()
        },
        acceso: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_control.findUnique({
                where: {
                    cont_id: _parent.cont_id
                }
            }).sys_acceso()
        },
        perfil: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_perfil.findUnique({
                where: {
                    perf_id: _parent.cont_perfil
                }
            })
        }
    }
}

export { tipeDefs as sysControlTipeDef, resolvers as sysControlResolv }