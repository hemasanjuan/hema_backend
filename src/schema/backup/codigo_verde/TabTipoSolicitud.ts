
import { context, Context } from '../../context';
import { FormatDateTimeSQLServer, getUserId } from "../../utils";
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from 'graphql-scalars';


const tipeDefs = `#graphql

    extend type Query {
        getAllTipoSolicitud: [TabTipoSolicitud!]!
        getOneTipoSolicitud(id_tipo_solicitud: Int): TabTipoSolicitud
    }

    extend type Mutation {
        createTipoSolicitud(data:tipoSolicitudInput): TabTipoSolicitud
        updateTipoSolicitud(id_tipo_solicitud: Int!, data:tipoSolicitudInput): TabTipoSolicitud
    }

    type TabTipoSolicitud {
        id_tipo_solicitud: Int!
        descripcion: String
        observacion: String
        estado: Int
        id_usu_registro: Int
        id_usu_modifica: Int
        fecha_registro: DateTime
        fecha_modifica: DateTime
        solicitudAtencion: [solicitud_atencion!]!
    }

    input tipoSolicitudInput {
        descripcion: String
        observacion: String
        estado: Int
        id_usu_registro: Int
        id_usu_modifica: Int
        fecha_registro: Date
        fecha_modifica: Date
    }

    scalar DateTime
    scalar Date
`

interface dataTipoSolicitud  {
    descripcion: string
    observacion: string
    estado: number
    id_usu_registro: number
    id_usu_modifica: number
    fecha_registro: Date
    fecha_modifica: Date
}
const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    
    Query: {
        getAllTipoSolicitud: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabTipoSolicitud.findMany()
        },
        getOneTipoSolicitud: async (_parent: any, _args: { id_tipo_solicitud: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabTipoSolicitud.findUnique({
                where: {
                    id_tipo_solicitud: _args.id_tipo_solicitud
                }
            })
        }
    },
    Mutation: {
        createTipoSolicitud: async (_parent: any, args: { data:dataTipoSolicitud }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabTipoSolicitud.create({
                data: {
                    descripcion: args.data.descripcion,
                    observacion: args.data.observacion,
                    estado: args.data.estado,
                    id_usu_registro: args.data.id_usu_registro,
                    id_usu_modifica: args.data.id_usu_modifica,
                    fecha_registro: FormatDateTimeSQLServer(new Date()),
                    // fecha_modifica: args.data.fecha_modifica
                }
            })
        },
        updateTipoSolicitud: async (_parent: any, args: { id_tipo_solicitud:number, data:dataTipoSolicitud }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabTipoSolicitud.update({
                where: {
                    id_tipo_solicitud: args.id_tipo_solicitud
                },
                data: {
                    descripcion: args.data.descripcion,
                    observacion: args.data.observacion,
                    estado: args.data.estado,
                    id_usu_registro: args.data.id_usu_registro,
                    id_usu_modifica: args.data.id_usu_modifica,
                    // fecha_registro: args.data.fecha_registro,
                    fecha_modifica: FormatDateTimeSQLServer(new Date())
                }
            })
        }
    },
    TabTipoSolicitud: {
        solicitudAtencion: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.tabTipoSolicitud.findUnique({
                where: {
                    id_tipo_solicitud: _parent.id_tipo_solicitud
                }
            }).solicitud_atencion()
        }
    }
}

export { tipeDefs as tabTipoSolicitudTipeDef, resolvers as tabTipoSolicitudResolv }