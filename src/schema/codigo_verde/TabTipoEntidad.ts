
import { context, Context } from '../../context';
import { FormatDateTimeSQLServer, getUserId } from "../../utils";
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from 'graphql-scalars';


const tipeDefs = `#graphql

    extend type Query {
        getAllTipoEntidad: [TabTipoEntidad!]!
        getOneTipoEntidad(id_tipo_entidad: Int): TabTipoEntidad
    }

    extend type Mutation {
        createTipoEntidad(data:tipoEntidadInput): TabTipoEntidad
        updateTipoEntidad(id_tipo_entidad: Int!, data:tipoEntidadInput): TabTipoEntidad
    }

    type TabTipoEntidad {
        id_tipo_entidad: Int!
        id_categoria: Int
        descripcion: String
        observacion: String
        activo: Boolean
        id_usu_registro: Int
        id_usu_modifica: Int
        fecha_registro: DateTime
        fecha_modifica: DateTime
        entidad: [TabEntidad]
    }

    input tipoEntidadInput {
        id_categoria: Int
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

interface dataTipoEntidad  {
    id_categoria: number
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
        getAllTipoEntidad: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabTipoEntidad.findMany()
        },
        getOneTipoEntidad: async (_parent: any, _args: { id_tipo_entidad: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabTipoEntidad.findUnique({
                where: {
                    id_tipo_entidad: _args.id_tipo_entidad
                }
            })
        }
    },
    Mutation: {
        createTipoEntidad: async (_parent: any, args: { data:dataTipoEntidad }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabTipoEntidad.create({
                data: {
                    id_categoria: args.data.id_categoria,
                    descripcion: args.data.descripcion,
                    observacion: args.data.observacion,
                    activo: args.data.activo,
                    id_usu_registro: args.data.id_usu_registro,
                    id_usu_modifica: args.data.id_usu_modifica,
                    fecha_registro: FormatDateTimeSQLServer(new Date()),
                }
            })
        },
        updateTipoEntidad: async (_parent: any, args: { id_tipo_entidad:number, data:dataTipoEntidad }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabTipoEntidad.update({
                where: {
                    id_tipo_entidad: args.id_tipo_entidad
                },
                data: {
                    id_categoria: args.data.id_categoria,
                    descripcion: args.data.descripcion,
                    observacion: args.data.observacion,
                    activo: args.data.activo,
                    id_usu_registro: args.data.id_usu_registro,
                    id_usu_modifica: args.data.id_usu_modifica,
                    fecha_modifica: FormatDateTimeSQLServer(new Date())
                }
            })
        }
    },
    TabTipoEntidad: {
        entidad: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.tabTipoEntidad.findUnique({
                where: {
                    id_tipo_entidad: _parent.id_tipo_entidad
                }
            }).TabEntidad()
        }
    }
}

export { tipeDefs as tabTipoEntidadTipeDef, resolvers as tabTipoEntidadResolv }