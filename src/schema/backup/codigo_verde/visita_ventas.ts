
import { context, Context } from '../../context';
import { FormatDateTimeSQLServer, getUserId } from "../../utils";
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from 'graphql-scalars';

const tipeDefs = `#graphql

    extend type Query {
        getAllVisitaVentas(skip:Int, take:Int): [visita_ventas!]!
        getOneVisitaVentas(visitav_id: Int): visita_ventas
    }

    extend type Mutation {
        createVisitaVentas(data:VisitaVentasInput): visita_ventas
        updateVisitaVentas(visitav_id: Int!, data:VisitaVentasInput): visita_ventas
    }

    type visita_ventas {
        visitav_id: Int!
        visitav_contact_id: Int
        visitav_contact: String
        visitav_entidad_id: String
        visitav_entidad: String
        visitav_estado_id: Int
        visitav_fecha_progra: DateTime
        visitav_fecha_visita: DateTime
        visitav_observaciones: String
        visitav_map_log: Float
        visitav_map_lat: Float
        visitav_id_competencia: Int
        visitav_botiquin: Boolean
        visitav_oxigeno: Boolean
        visitav_restautante: Boolean
        visitav_hotel: Boolean
        visitav_id_usu_registro_progra: Int
        visitav_id_usu_registro_visita: Int
        visitav_id_usu_modifica: Int
        visitav_fecha_registro: DateTime
        visitav_fecha_modifica: DateTime
        visitav_usuario_acceso_create: Int
        visitav_usuario_acceso_update: Int
        contacto: contacto
        entidad: TabEntidad
        competencia: visita_competencia
        estado: TabEstado
    }

    input VisitaVentasInput {
        visitav_contact_id: Int
        visitav_contact: String
        visitav_entidad_id: String
        visitav_entidad: String
        visitav_estado_id: Int
        visitav_fecha_progra: DateTime
        visitav_fecha_visita: DateTime
        visitav_observaciones: String
        visitav_map_log: Float
        visitav_map_lat: Float
        visitav_id_competencia: Int
        visitav_botiquin: Boolean
        visitav_oxigeno: Boolean
        visitav_restautante: Boolean
        visitav_hotel: Boolean
        visitav_id_usu_registro_progra: Int
        visitav_id_usu_registro_visita: Int
        visitav_id_usu_modifica: Int
        visitav_fecha_registro: DateTime
        visitav_fecha_modifica: DateTime
        visitav_usuario_acceso_create: Int
        visitav_usuario_acceso_update: Int
    }

    scalar DateTime
    scalar Date
`

interface dataVisitaVentas {
    visitav_contact_id: number,
    visitav_contact: string,
    visitav_entidad_id: string,
    visitav_entidad: string,
    visitav_estado_id: number,
    visitav_fecha_progra: Date,
    visitav_fecha_visita: Date,
    visitav_observaciones: string,
    visitav_map_log: number,
    visitav_map_lat: number,
    visitav_id_competencia: number,
    visitav_botiquin: boolean,
    visitav_oxigeno: boolean,
    visitav_restautante: boolean,
    visitav_hotel: boolean,
    visitav_id_usu_registro_progra: number, //el que programa la visita
    visitav_id_usu_registro_visita: number, //el id del vendedor odosiano que hará la visita
    visitav_id_usu_modifica: number,
    visitav_fecha_registro: Date
    visitav_fecha_modifica: Date
    visitav_usuario_acceso_create: number, //DAR DE BAJA
    visitav_usuario_acceso_update: number, //DAR DE BAJA

}
const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,

    Query: {
        getAllVisitaVentas: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            console.log("hola",userId)
            return await context.prisma.$queryRaw`SELECT * FROM visita_ventas WHERE visitav_id_usu_registro_visita=${userId} AND visitav_estado_id <> 3 AND visitav_fecha_progra=convert(date,GETDATE())`
        },
        getOneVisitaVentas: async (_parent: any, _args: { visitav_id: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.visita_ventas.findUnique({
                where: {
                    visitav_id: _args.visitav_id
                }
            })
        }
    },
    Mutation: {
        createVisitaVentas: async (_parent: any, args: { data: dataVisitaVentas, contac_usuario_reg: number }, context: Context) => {
            const userId = getUserId(context)

            return await context.prisma.visita_ventas.create({
                data: {
                    visitav_contact_id: args.data.visitav_contact_id,
                    visitav_contact: args.data.visitav_contact,
                    visitav_entidad_id: args.data.visitav_entidad_id,
                    visitav_entidad: args.data.visitav_entidad,
                    visitav_estado_id: args.data.visitav_estado_id,
                    visitav_fecha_progra: args.data.visitav_fecha_progra,
                    visitav_fecha_visita: args.data.visitav_fecha_visita,
                    visitav_observaciones: args.data.visitav_observaciones,
                    visitav_map_log: args.data.visitav_map_log,
                    visitav_map_lat: args.data.visitav_map_lat,
                    visitav_id_competencia: args.data.visitav_id_competencia,
                    visitav_botiquin: args.data.visitav_botiquin,
                    visitav_oxigeno: args.data.visitav_oxigeno,
                    visitav_restautante: args.data.visitav_restautante,
                    visitav_hotel: args.data.visitav_hotel,
                    visitav_id_usu_registro_progra: args.data.visitav_id_usu_registro_progra,
                    visitav_id_usu_registro_visita: args.data.visitav_id_usu_registro_visita,
                    visitav_id_usu_modifica: args.data.visitav_id_usu_modifica,
                    visitav_fecha_registro: FormatDateTimeSQLServer(new Date()),
                }
            })
        },
        updateVisitaVentas: async (_parent: any, args: { visitav_id: number, data: dataVisitaVentas, contac_usuario_update: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.visita_ventas.update({
                where: {
                    visitav_id: args.visitav_id
                },
                data: {
                    visitav_contact_id: args.data.visitav_contact_id,
                    visitav_contact: args.data.visitav_contact,
                    visitav_entidad_id: args.data.visitav_entidad_id,
                    visitav_entidad: args.data.visitav_entidad,
                    visitav_estado_id: args.data.visitav_estado_id,
                    visitav_fecha_visita: FormatDateTimeSQLServer(new Date()),
                    visitav_observaciones: args.data.visitav_observaciones,
                    visitav_map_log: args.data.visitav_map_log,
                    visitav_map_lat: args.data.visitav_map_lat,
                    visitav_id_competencia: args.data.visitav_id_competencia,
                    visitav_botiquin: args.data.visitav_botiquin,
                    visitav_oxigeno: args.data.visitav_oxigeno,
                    visitav_restautante: args.data.visitav_restautante,
                    visitav_hotel: args.data.visitav_hotel,
                    visitav_id_usu_modifica: args.data.visitav_id_usu_modifica,
                    visitav_fecha_modifica: FormatDateTimeSQLServer(new Date()),
                }
            })
        }
    },
    visita_ventas: {
        contacto: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.visita_ventas.findUnique({
                where: {
                    visitav_id: _parent.visitav_id
                }
            }).contacto()
        },
        estado: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.visita_ventas.findUnique({
                where: {
                    visitav_id: _parent.visitav_id
                }
            }).TabEstado()
        },
        entidad: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.visita_ventas.findUnique({
                where: {
                    visitav_id: _parent.visitav_id
                }
            }).TabEntidad()
        },
        competencia: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.visita_ventas.findUnique({
                where: {
                    visitav_id: _parent.visitav_id
                }
            }).visita_competencia()
        }
    }
}


export { tipeDefs as visitaVentasTipeDef, resolvers as visitaVentasResolv }