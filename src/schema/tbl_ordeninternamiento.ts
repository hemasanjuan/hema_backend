
import { context, Context } from '../context';
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from "graphql-scalars";

const tipeDefs = `#graphql

    extend type Query {
        getAlltbl_ordeninternamiento: [tbl_ordeninternamiento!]!
        getOnetbl_ordeninternamiento(ordatencion_cod: Int!): [tbl_ordeninternamiento!]!
    }

    type tbl_ordeninternamiento {
        ordatencion_cod: Int!
        ordatencion_paciente_cod: Int
        ordatencion_tpaciente_cod: Int
        ordatencion_fcreacion: DateTime
        ordatencion_usrcreacion: String
        ordatencion_ipcreacion: String
        ordatencion_fregistro: DateTime
        ordatencion_fcierre: DateTime
        ordatencion_negprc_emp_aseg_ecod: Int
        ordatencion_negprc_emp_aseg_acod: Int
        ordatencion_negprc_emp_aseg_ncod: Int
        ordatencion_tpatencion_cod: Int
        ordatencion_estado: Int
        ordatencion_obs: String
        ordatencion_aseg_vntcod: String
        ordatencion_autorizacion_act: Int
        ordatencion_usregistro: String
        ordatencion_mpcod: Int
        ordatencion_tporigen: Int
        ordatencion_clasifprestacion: Int
        ordatencion_cierre_obs: String
        ordatencion_mtso: Int
        ordatencion_control_atencion: Int
        ordatencion_ffin: DateTime
        ordatencion_eventual: Int
        ordatencion_factualizacion: DateTime
        ordatencion_fdigital: DateTime
        ordatencion_hcdigital: String
    }

    ${DateTimeTypeDefinition}
    ${DateTypeDefinition}

`

interface I_tbl_ordeninternamiento {
    ordatencion_cod: number,
    ordatencion_paciente_cod: number,
    ordatencion_tpaciente_cod: number,
    ordatencion_fcreacion: Date,
    ordatencion_usrcreacion: string,
    ordatencion_ipcreacion: string,
    ordatencion_fregistro: Date,
    ordatencion_fcierre: Date,
    ordatencion_negprc_emp_aseg_ecod: number,
    ordatencion_negprc_emp_aseg_acod: number,
    ordatencion_negprc_emp_aseg_ncod: number,
    ordatencion_tpatencion_cod: number,
    ordatencion_estado: number,
    ordatencion_obs: string,
    ordatencion_aseg_vntcod: string,
    ordatencion_autorizacion_act: number,
    ordatencion_usregistro: string,
    ordatencion_mpcod: number,
    ordatencion_tporigen: number,
    ordatencion_clasifprestacion: number,
    ordatencion_cierre_obs: string,
    ordatencion_mtso: number,
    ordatencion_control_atencion: number,
    ordatencion_ffin: Date,
    ordatencion_eventual: number,
    ordatencion_factualizacion: Date,
    ordatencion_fdigital: Date,
    ordatencion_hcdigital: string,
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getOnetbl_ordeninternamiento: async (_parent: any, _args: { ordatencion_cod: number }, context: Context) => {

            // const data01 = context.prisma.$queryRaw`SELECT * FROM tbl_ordeninternamiento`

            // return context.prisma.$queryRaw`SELECT * FROM tbl_ordeninternamiento order by ordatencion_cod desc limit 100`

            return await context.prisma.tbl_ordeninternamiento.findMany({
                skip: 0,
                take: 50,
                orderBy: {
                    ordinternamiento_acod: 'desc'
                }
            })
        },
        getAlltbl_ordeninternamiento: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.tbl_ordeninternamiento.findMany({
                skip: 0,
                take: 50,
                orderBy: {
                    ordinternamiento_acod: 'desc'
                }
            })
        }
    },
}

export { tipeDefs as tbl_ordeninternamientoTipeDef, resolvers as tbl_ordeninternamientoResolv }
