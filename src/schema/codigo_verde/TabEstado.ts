
import { context, Context } from '../../context';
import { getUserId } from "../../utils";

const tipeDefs = `#graphql

    extend type Query {
        getAllEstado: [TabEstado!]!
        getOneEstado(IdEstado: Int): TabEstado
    }

    extend type Mutation {
        createEstado(data:estadoInput): TabEstado
        updateEstado(IdEstado: Int!, data:estadoInput): TabEstado
    }

    type TabEstado {
        IdEstado: Int!
        Codigo: String
        Descripcion: String
        IdGrupo: Int
        Activo: Boolean
        ContactCenter: Boolean
        Habitacion: Boolean,
        solicitudAtencion: [solicitud_atencion!]!
        visitaVentas: [visita_ventas!]!
    }

    input estadoInput {
        Codigo: String,
        Descripcion: String,
        IdGrupo: Int,
        Activo: Boolean,
        ContactCenter: Boolean,
        Habitacion: Boolean
    }
`

interface dataEstado  {
    Codigo: string,
    Descripcion: string,
    IdGrupo: number,
    Activo: boolean,
    ContactCenter: boolean,
    Habitacion: boolean
}
const resolvers = {
    
    Query: {
        getAllEstado: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabEstado.findMany()
        },
        getOneEstado: async (_parent: any, _args: { IdEstado: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabEstado.findUnique({
                where: {
                    IdEstado: _args.IdEstado
                }
            })
        }
    },
    Mutation: {
        createEstado: async (_parent: any, args: { data:dataEstado }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabEstado.create({
                data: {
                    Codigo: args.data.Codigo,
                    Descripcion: args.data.Descripcion,
                    IdGrupo: args.data.IdGrupo,
                    Activo: args.data.Activo,
                    ContactCenter: args.data.ContactCenter,
                    Habitacion: args.data.Habitacion
                }
            })
        },
        updateEstado: async (_parent: any, args: { IdEstado:number, data:dataEstado }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabEstado.update({
                where: {
                    IdEstado: args.IdEstado
                },
                data: {
                    Codigo: args.data.Codigo,
                    Descripcion: args.data.Descripcion,
                    IdGrupo: args.data.IdGrupo,
                    Activo: args.data.Activo,
                    ContactCenter: args.data.ContactCenter,
                    Habitacion: args.data.Habitacion
                }
            })
        }
    },
    TabEstado: {
        solicitudAtencion: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.tabEstado.findUnique({
                where: {
                    IdEstado: _parent.IdEstado
                }
            }).solicitud_atencion()
        },
        visitaVentas: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.tabEstado.findUnique({
                where: {
                    IdEstado: _parent.IdEstado
                }
            }).visita_ventas()
        }
    }
}

export { tipeDefs as tabEstadoTipeDef, resolvers as tabEstadoResolv }