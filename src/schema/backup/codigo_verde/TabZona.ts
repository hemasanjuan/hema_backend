
import { context, Context } from '../../context';
import { FormatDateTimeSQLServer, getUserId } from "../../utils";
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from 'graphql-scalars';


const tipeDefs = `#graphql

    extend type Query {
        getAllZona: [TabZona!]!
        getOneZona(id_zona: Int): TabZona
    }

    extend type Mutation {
        createZona(data:zonaInput): TabZona
        updateZona(id_zona: Int!, data:zonaInput): TabZona
    }

    type TabZona {
        id_zona: Int!
        descripcion: String
        observacion: String
        activo: Boolean
        id_usu_registro: Int
        id_usu_modifica: Int
        fecha_registro: DateTime
        fecha_modifica: DateTime
        entidad: [TabEntidad]
    }

    input zonaInput {
        descripcion: String
        observacion: String
        activo: Boolean
        id_usu_registro: Int
        id_usu_modifica: Int
        fecha_registro: Date
        fecha_modifica: Date
    }

    scalar DateTime
    scalar Date
`

interface dataZona  {
    descripcion: string
    observacion: string
    activo: boolean
    id_usu_registro: number
    id_usu_modifica: number
    fecha_registro: Date
    fecha_modifica: Date
}
const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    
    Query: {
        getAllZona: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabZona.findMany({
                where: {
                    activo: true
                }
            })
        },
        getOneZona: async (_parent: any, _args: { id_zona: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabZona.findUnique({
                where: {
                    id_zona: _args.id_zona
                }
            })
        }
    },
    Mutation: {
        createZona: async (_parent: any, args: { data:dataZona }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabZona.create({
                data: {
                    descripcion: args.data.descripcion,
                    observacion: args.data.observacion,
                    activo: args.data.activo,
                    id_usu_registro: args.data.id_usu_registro,
                    id_usu_modifica: args.data.id_usu_modifica,
                    fecha_registro: FormatDateTimeSQLServer(new Date()),
                    // fecha_modifica: args.data.fecha_modifica
                }
            })
        },
        updateZona: async (_parent: any, args: { id_zona:number, data:dataZona }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabZona.update({
                where: {
                    id_zona: args.id_zona
                },
                data: {
                    descripcion: args.data.descripcion,
                    observacion: args.data.observacion,
                    activo: args.data.activo,
                    id_usu_registro: args.data.id_usu_registro,
                    id_usu_modifica: args.data.id_usu_modifica,
                    // fecha_registro: args.data.fecha_registro,
                    fecha_modifica: FormatDateTimeSQLServer(new Date())
                }
            })
        }
    },
    TabZona: {
        entidad: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.tabZona.findUnique({
                where: {
                    id_zona: _parent.id_zona
                }
            }).TabEntidad()
        }
    }
}

export { tipeDefs as tabZonaTipeDef, resolvers as tabZonaResolv }