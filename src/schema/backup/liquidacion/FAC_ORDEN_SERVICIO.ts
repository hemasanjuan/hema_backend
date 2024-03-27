
import { context, Context } from '../../context';
import { FormatDateTimeSQLServer, getUserId } from "../../utils";
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from "graphql-scalars";
import { atencionResolv } from '../atencion/atencion';

const tipeDefs = `#graphql

    extend type Query {
        getAllFAC_ORDEN_SERVICIO: [FAC_ORDEN_SERVICIO!]!
        getOneFAC_ORDEN_SERVICIO(id_orden_servicio: Int!): FAC_ORDEN_SERVICIO
    }

    extend type Mutation {
        createFAC_ORDEN_SERVICIO(data:Input_FAC_ORDEN_SERVICIO): FAC_ORDEN_SERVICIO
        updateFAC_ORDEN_SERVICIO(id_orden_servicio: Int!, data:Input_FAC_ORDEN_SERVICIO): FAC_ORDEN_SERVICIO
    }

    type FAC_ORDEN_SERVICIO {
        id_orden_servicio: Int!
        f_paciente: Int
        id_atencion: Int
        t_observacion: String
        n_total: Int
        n_paciente: Int
        n_garante: Int
        n_igv_total: Int
        n_igv_paciente: Int
        n_igv_garante: Int
        f_estado: Int
        id_user_registro: Int
        id_user_modifica: Int
        id_user_proceso: Int
        id_user_anulacion: Int
        d_fecha_registro: DateTime
        d_fecha_modifica: DateTime
        d_fecha_proceso: DateTime
        d_fecha_anulacion: DateTime
        f_resultado: Int
        n_copago_fijo: Int
        n_copago_variable: Int
        id_comprobante: Int
        usu_acceso_registro: Int
        usu_acceso_modifica: Int
        usu_acceso_proceso: Int
        usu_acceso_anulacion: Int
    }

    input Input_FAC_ORDEN_SERVICIO {
        f_paciente: Int
        id_atencion: Int
        t_observacion: String
        n_total: Int
        n_paciente: Int
        n_garante: Int
        n_igv_total: Int
        n_igv_paciente: Int
        n_igv_garante: Int
        f_estado: Int
        id_user_registro: Int
        id_user_modifica: Int
        id_user_proceso: Int
        id_user_anulacion: Int
        d_fecha_registro: DateTime
        d_fecha_modifica: DateTime
        d_fecha_proceso: DateTime
        d_fecha_anulacion: DateTime
        f_resultado: Int
        n_copago_fijo: Int
        n_copago_variable: Int
        id_comprobante: Int
        usu_acceso_registro: Int
        usu_acceso_modifica: Int
        usu_acceso_proceso: Int
        usu_acceso_anulacion: Int
    }
    ${DateTimeTypeDefinition}
    ${DateTypeDefinition}

`

interface I_FAC_ORDEN_SERVICIO {
    f_paciente: number,
    id_atencion: number,
    t_observacion: string,
    n_total: number,
    n_paciente: number,
    n_garante: number,
    n_igv_total: number,
    n_igv_paciente: number,
    n_igv_garante: number,
    f_estado: number,
    id_user_registro: number,
    id_user_modifica: number,
    id_user_proceso: number,
    id_user_anulacion: number,
    d_fecha_registro: Date,
    d_fecha_modifica: Date,
    d_fecha_proceso: Date,
    d_fecha_anulacion: Date,
    f_resultado: number,
    n_copago_fijo: number,
    n_copago_variable: number,
    id_comprobante: number,
    usu_acceso_registro: number,
    usu_acceso_modifica: number,
    usu_acceso_proceso: number,
    usu_acceso_anulacion: number,
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getOneFAC_ORDEN_SERVICIO: async (_parent: any, _args: { id_orden_servicio: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.fAC_ORDEN_SERVICIO.findUnique({
                where: {
                    id_orden_servicio: _args.id_orden_servicio
                }
            })
        },
        getAllFAC_ORDEN_SERVICIO: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.fAC_ORDEN_SERVICIO.findMany()
        }
    },
    Mutation: {
        createFAC_ORDEN_SERVICIO: async (_parent: any, _args: { data: I_FAC_ORDEN_SERVICIO }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.fAC_ORDEN_SERVICIO.create({
                data: {
                    f_paciente: _args.data.f_paciente,
                    id_atencion: _args.data.id_atencion,
                    t_observacion: _args.data.t_observacion,
                    n_total: _args.data.n_total,
                    n_paciente: _args.data.n_paciente,
                    n_garante: _args.data.n_garante,
                    n_igv_total: _args.data.n_igv_total,
                    n_igv_paciente: _args.data.n_igv_paciente,
                    n_igv_garante: _args.data.n_igv_garante,
                    f_estado: _args.data.f_estado,
                    d_fecha_registro: _args.data.d_fecha_registro,
                    f_resultado: null,
                    n_copago_fijo: _args.data.n_copago_fijo,
                    n_copago_variable: _args.data.n_copago_variable,
                    id_comprobante: _args.data.id_comprobante,
                    usu_acceso_registro: _args.data.usu_acceso_registro,
                }
            })
        },
        updateFAC_ORDEN_SERVICIO: async (_parent: any, _args: { id_orden_servicio: number, data: I_FAC_ORDEN_SERVICIO }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.fAC_ORDEN_SERVICIO.update({
                where: {
                    id_orden_servicio: _args.id_orden_servicio
                },
                data: {
                    f_paciente: _args.data.f_paciente,
                    id_atencion: _args.data.id_atencion,
                    t_observacion: _args.data.t_observacion,
                    n_total: _args.data.n_total,
                    n_paciente: _args.data.n_paciente,
                    n_garante: _args.data.n_garante,
                    n_igv_total: _args.data.n_igv_total,
                    n_igv_paciente: _args.data.n_igv_paciente,
                    n_igv_garante: _args.data.n_igv_garante,
                    f_estado: _args.data.f_estado,
                    d_fecha_modifica: _args.data.d_fecha_modifica,
                    f_resultado: null,
                    n_copago_fijo: _args.data.n_copago_fijo,
                    n_copago_variable: _args.data.n_copago_variable,
                    id_comprobante: _args.data.id_comprobante,
                    usu_acceso_modifica: _args.data.usu_acceso_modifica,
                }
            })
        }
    },
}

export { tipeDefs as FAC_ORDEN_SERVICIOTipeDef, resolvers as FAC_ORDEN_SERVICIOResolv }