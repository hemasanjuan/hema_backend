
import { context, Context } from '../../context';
import { FormatDateTimeSQLServer, getUserId } from "../../utils";
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from "graphql-scalars";
import { atencionResolv } from '../atencion/atencion';

const tipeDefs = `#graphql

    extend type Query {
        getAllFAC_ORDEN_SERVICIO_DETALLE: [FAC_ORDEN_SERVICIO_DETALLE!]!
        getOneFAC_ORDEN_SERVICIO_DETALLE(id_orden_servicio_detalle: Int!): FAC_ORDEN_SERVICIO_DETALLE
    }

    extend type Mutation {
        createFAC_ORDEN_SERVICIO_DETALLE(data:Input_FAC_ORDEN_SERVICIO_DETALLE): FAC_ORDEN_SERVICIO_DETALLE
        updateFAC_ORDEN_SERVICIO_DETALLE(id_orden_servicio_detalle: Int!, data:Input_FAC_ORDEN_SERVICIO_DETALLE): FAC_ORDEN_SERVICIO_DETALLE
    }

    type FAC_ORDEN_SERVICIO_DETALLE {
        id_orden_servicio_detalle: Int!
        id_orden_servicio: Int
        id_tarifario_segus: Int
        n_precio: Int
        n_cantidad: Int
        n_parcial: Int
        n_dscto_1_porc: Int
        n_dscto_1_imp: Int
        n_dscto_2_porc: Int
        n_dscto_2_imp: Int
        n_aumento_1_porc: Int
        n_aumento_1_imp: Int
        id_user_dscto: Int
        n_dscto_aud_porc: Int
        n_dscto_aud_imp: Int
        t_dscto_aud_obs: String
        n_total: Int
        n_paciente: Int
        n_garante: Int
        n_copago_variable: Int
        n_copago_fijo: Int
        f_copago_fijo: Int
        n_igv_total: Int
        n_igv_paciente: Int
        n_igv_garante: Int
        f_afecto: Int
        f_estado: Int
        f_habitacion: Int
        f_honorario: Int
        id_profesional: Int
        f_pago: Int
        n_profesional: Int
        n_pago: Int
        id_user_pago: Int
        d_fecha_pago: DateTime
        usu_acceso_dscto: Int
        usu_acceso_pago: Int
    }

    input Input_FAC_ORDEN_SERVICIO_DETALLE {
        id_orden_servicio: Int
        id_tarifario_segus: Int
        n_precio: Int
        n_cantidad: Int
        n_parcial: Int
        n_dscto_1_porc: Int
        n_dscto_1_imp: Int
        n_dscto_2_porc: Int
        n_dscto_2_imp: Int
        n_aumento_1_porc: Int
        n_aumento_1_imp: Int
        id_user_dscto: Int
        n_dscto_aud_porc: Int
        n_dscto_aud_imp: Int
        t_dscto_aud_obs: String
        n_total: Int
        n_paciente: Int
        n_garante: Int
        n_copago_variable: Int
        n_copago_fijo: Int
        f_copago_fijo: Int
        n_igv_total: Int
        n_igv_paciente: Int
        n_igv_garante: Int
        f_afecto: Int
        f_estado: Int
        f_habitacion: Int
        f_honorario: Int
        id_profesional: Int
        f_pago: Int
        n_profesional: Int
        n_pago: Int
        id_user_pago: Int
        d_fecha_pago: DateTime
        usu_acceso_dscto: Int
        usu_acceso_pago: Int
    }
    ${DateTimeTypeDefinition}
    ${DateTypeDefinition}

`

interface I_FAC_ORDEN_SERVICIO_DETALLE {
    id_orden_servicio: number,
    id_tarifario_segus: number,
    n_precio: number,
    n_cantidad: number,
    n_parcial: number,
    n_dscto_1_porc: number,
    n_dscto_1_imp: number,
    n_dscto_2_porc: number,
    n_dscto_2_imp: number,
    n_aumento_1_porc: number,
    n_aumento_1_imp: number,
    id_user_dscto: number,
    n_dscto_aud_porc: number,
    n_dscto_aud_imp: number,
    t_dscto_aud_obs: string,
    n_total: number,
    n_paciente: number,
    n_garante: number,
    n_copago_variable: number,
    n_copago_fijo: number,
    f_copago_fijo: number,
    n_igv_total: number,
    n_igv_paciente: number,
    n_igv_garante: number,
    f_afecto: number,
    f_estado: number,
    f_habitacion: number,
    f_honorario: number,
    id_profesional: number,
    f_pago: number,
    n_profesional: number,
    n_pago: number,
    id_user_pago: number,
    d_fecha_pago: Date,
    usu_acceso_dscto: number,
    usu_acceso_pago: number,
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getOneFAC_ORDEN_SERVICIO_DETALLE: async (_parent: any, _args: { id_orden_servicio_detalle: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.fAC_ORDEN_SERVICIO_DETALLE.findUnique({
                where: {
                    id_orden_servicio_detalle: _args.id_orden_servicio_detalle
                }
            })
        },
        getAllFAC_ORDEN_SERVICIO_DETALLE: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.fAC_ORDEN_SERVICIO_DETALLE.findMany()
        }
    },
    Mutation: {
        createFAC_ORDEN_SERVICIO_DETALLE: async (_parent: any, _args: { data: I_FAC_ORDEN_SERVICIO_DETALLE }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.fAC_ORDEN_SERVICIO_DETALLE.create({
                data: {
                    id_orden_servicio: _args.data.id_orden_servicio,
                    id_tarifario_segus: _args.data.id_tarifario_segus,
                    n_precio: _args.data.n_precio,
                    n_cantidad: 1,
                    n_parcial: _args.data.n_parcial,
                    n_dscto_1_porc: _args.data.n_dscto_1_porc,
                    n_dscto_1_imp: _args.data.n_dscto_1_imp,
                    n_dscto_2_porc: _args.data.n_dscto_2_porc,
                    n_dscto_2_imp: _args.data.n_dscto_2_imp,
                    n_aumento_1_porc: 0,
                    n_aumento_1_imp: 0,
                    id_user_dscto: _args.data.id_user_dscto,
                    n_dscto_aud_porc: 0,
                    n_dscto_aud_imp: 0,
                    t_dscto_aud_obs: _args.data.t_dscto_aud_obs,
                    n_total: _args.data.n_total,
                    n_paciente: _args.data.n_paciente,
                    n_garante: _args.data.n_garante,
                    n_copago_variable: _args.data.n_copago_variable,
                    n_copago_fijo: _args.data.n_copago_fijo,
                    f_copago_fijo: _args.data.f_copago_fijo,
                    n_igv_total: _args.data.n_igv_total,
                    n_igv_paciente: _args.data.n_igv_paciente,
                    n_igv_garante: _args.data.n_igv_garante,
                    f_afecto: _args.data.f_afecto,
                    f_estado: _args.data.f_estado,
                    f_habitacion: 0,
                    f_honorario: 0,
                    id_profesional: 0,
                    f_pago: 0,
                    n_profesional: 0,
                    n_pago: _args.data.n_pago,
                    id_user_pago: _args.data.id_user_pago,
                    d_fecha_pago: _args.data.d_fecha_pago,
                    usu_acceso_dscto: _args.data.usu_acceso_dscto,
                    usu_acceso_pago: _args.data.usu_acceso_pago,
                }
            })
        },
        updateFAC_ORDEN_SERVICIO_DETALLE: async (_parent: any, _args: { id_orden_servicio_detalle: number, data: I_FAC_ORDEN_SERVICIO_DETALLE }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.fAC_ORDEN_SERVICIO_DETALLE.update({
                where: {
                    id_orden_servicio_detalle: _args.id_orden_servicio_detalle
                },
                data: {
                    id_orden_servicio: _args.data.id_orden_servicio,
                    id_tarifario_segus: _args.data.id_tarifario_segus,
                    n_precio: _args.data.n_precio,
                    n_cantidad: 1,
                    n_parcial: _args.data.n_parcial,
                    n_dscto_1_porc: _args.data.n_dscto_1_porc,
                    n_dscto_1_imp: _args.data.n_dscto_1_imp,
                    n_dscto_2_porc: _args.data.n_dscto_2_porc,
                    n_dscto_2_imp: _args.data.n_dscto_2_imp,
                    n_aumento_1_porc: 0,
                    n_aumento_1_imp: 0,
                    id_user_dscto: _args.data.id_user_dscto,
                    n_dscto_aud_porc: 0,
                    n_dscto_aud_imp: 0,
                    t_dscto_aud_obs: _args.data.t_dscto_aud_obs,
                    n_total: _args.data.n_total,
                    n_paciente: _args.data.n_paciente,
                    n_garante: _args.data.n_garante,
                    n_copago_variable: _args.data.n_copago_variable,
                    n_copago_fijo: _args.data.n_copago_fijo,
                    f_copago_fijo: _args.data.f_copago_fijo,
                    n_igv_total: _args.data.n_igv_total,
                    n_igv_paciente: _args.data.n_igv_paciente,
                    n_igv_garante: _args.data.n_igv_garante,
                    f_afecto: _args.data.f_afecto,
                    f_estado: _args.data.f_estado,
                    f_habitacion: 0,
                    f_honorario: 0,
                    id_profesional: 0,
                    f_pago: 0,
                    n_profesional: 0,
                    n_pago: _args.data.n_pago,
                    id_user_pago: _args.data.id_user_pago,
                    d_fecha_pago: _args.data.d_fecha_pago,
                    usu_acceso_dscto: _args.data.usu_acceso_dscto,
                    usu_acceso_pago: _args.data.usu_acceso_pago,
                }
            })
        }
    },
}

export { tipeDefs as FAC_ORDEN_SERVICIO_DETALLETipeDef, resolvers as FAC_ORDEN_SERVICIO_DETALLEResolv }