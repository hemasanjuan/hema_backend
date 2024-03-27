
import { context, Context } from '../../context'
import { getUserId } from "../../utils";


const tipeDefs = `#graphql

    extend type Query {
        getAllSucursal: [TabSucursal!]!
        getOneSucursal(IdSucursal: Int): TabSucursal
    }

    extend type Mutation {
        createSucursal(data:TabSucursalInput): TabSucursal,
        updateSucursal(IdSucursal: Int!, data:TabSucursalInput): TabSucursal
    }

    type TabSucursal {
        IdSucursal: Int,
        IdEmpresa: Int,
        Descripcion: String,
        Activo: Boolean,
        id_sede_romsoft: Int,
        solicitudAtencion: [solicitud_atencion!]!
        empresa: empresa
    }

    input TabSucursalInput{
        IdEmpresa: Int,
        Descripcion: String,
        Activo: Boolean,
    }
`

interface dataSucursal {
    IdEmpresa: number,
    Descripcion: string,
    Activo: boolean,
}

const resolvers = {
    Query: {
        getAllSucursal: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabSucursal.findMany({
                where: {
                    Activo: true
                }
            })
        },
        getOneSucursal: async (_parent: any, _args: { IdSucursal: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabSucursal.findUnique({
                where: {
                    IdSucursal: _args.IdSucursal
                }
            })
        }
    },
    Mutation: {
        createSucursal: async (_parent: any, args: { data: dataSucursal }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabSucursal.create({
                data: args.data
            })
        },
        updateSucursal: async (_parent: any, args: { IdSucursal: number, data: dataSucursal }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabSucursal.update({
                where: {
                    IdSucursal: args.IdSucursal
                },
                data: args.data
            })
        },
    },
    TabSucursal: {
        solicitudAtencion: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.tabSucursal.findUnique({
                where: {
                    IdSucursal: _parent.IdSucursal
                }
            }).solicitud_atencion()
        },
        empresa: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.tabSucursal.findUnique({
                where: {
                    IdSucursal: _parent.IdSucursal
                }
            }).empresa()
        }
    }
}


export { tipeDefs as sucursalTipeDef, resolvers as sucursalResolv }