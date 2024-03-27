
import { context, Context } from '../../context';
import { FormatDateTimeSQLServer, getUserId, newIdEmpresa } from "../../utils";
import { DateTimeResolver } from 'graphql-scalars';

const tipeDefs = `#graphql

    extend type Query {
        getAllVisitaCompetencia: [visita_competencia!]!
        getOneVisitaCompetencia(compv_id: Int): visita_competencia
    }

    extend type Mutation {
        createVisitaCompetencia(data:visitaCompetenciaInput): visita_competencia
        updateVisitaCompetencia(compv_id: Int!, data:visitaCompetenciaInput): visita_competencia
    }

    type visita_competencia {
        compv_id: Int!
        compv_nombre_comer: String
        compv_activo: Boolean
        compv_id_usu_registro: Int
        compv_id_usu_modifica: Int
        compv_fecha_reg: DateTime
        compv_fecha_modi: DateTime
        visitaVentas: [visita_ventas!]!
        
    }

    input visitaCompetenciaInput {
        compv_id: Int
        compv_nombre_comer: String
        compv_activo: Boolean
        compv_id_usu_registro: Int
        compv_id_usu_modifica: Int
        compv_fecha_reg: DateTime
        compv_fecha_modi: DateTime
    }

    scalar DateTime
`

interface dataCompetencia {
    compv_id: number,
    compv_nombre_comer: string,
    compv_activo: boolean,
    compv_id_usu_registro: number,
    compv_id_usu_modifica: number,
    compv_fecha_reg: any,
    compv_fecha_modi: any,
}

const resolvers = {
    DateTime: DateTimeResolver,
    Query: {
        
        getAllVisitaCompetencia: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.visita_competencia.findMany()
        },
        getOneVisitaCompetencia: async (_parent: any, _args: { compv_id: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.visita_competencia.findUnique({
                where: {
                    compv_id: _args.compv_id
                }
            })
        }
    },
    Mutation: {
        createVisitaCompetencia: async (_parent: any, args: { data:dataCompetencia }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.visita_competencia.create({
                data: {
                    compv_nombre_comer: args.data.compv_nombre_comer,
                    compv_activo: args.data.compv_activo,
                    compv_id_usu_registro: args.data.compv_id_usu_registro,
                    compv_id_usu_modifica: args.data.compv_id_usu_modifica,
                    compv_fecha_reg: args.data.compv_fecha_reg,
                    compv_fecha_modi: FormatDateTimeSQLServer(new Date())
                }
            })
        },
        updateCanal: async (_parent: any, args: { compv_id:number, data:dataCompetencia }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.visita_competencia.update({
                where: {
                    compv_id: args.compv_id
                },
                data: {
                    compv_nombre_comer: args.data.compv_nombre_comer,
                    compv_activo: args.data.compv_activo,
                    compv_id_usu_registro: args.data.compv_id_usu_registro,
                    compv_id_usu_modifica: args.data.compv_id_usu_modifica,
                    compv_fecha_reg: args.data.compv_fecha_reg,
                    compv_fecha_modi: FormatDateTimeSQLServer(new Date())
                }
            })
        }
    },
    visita_competencia: {
        visitaVentas: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.visita_competencia.findUnique({
                where: {
                    compv_id: _parent.compv_id
                }
            }).visita_ventas()
        }
    }
}


export { tipeDefs as visitaCompetenciaTipeDef, resolvers as visitaCompetenciaResolv }