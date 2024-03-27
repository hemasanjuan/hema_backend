
import { context, Context } from '../../context';
import { diferenciaFechasToHoras, FormatDateTimeSQLServer, getUserId } from "../../utils";
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from "graphql-scalars";

const tipeDefs = `#graphql

    extend type Query {
        getOneADM_ORDEN_SERVICIO_DETALLE(id_orden_servicio_detalle: Int!): ADM_ORDEN_SERVICIO_DETALLE
        getFindADM_ORDEN_SERVICIO_DETALLE(id_orden_servicio: Int): [ADM_ORDEN_SERVICIO_DETALLE]
    }

    extend type Mutation {
        createADM_ORDEN_SERVICIO_DETALLE(data:Input_ADM_ORDEN_SERVICIO_DETALLE): ADM_ORDEN_SERVICIO_DETALLE
        updateADM_ORDEN_SERVICIO_DETALLE(id_orden_servicio_detalle: Int!, data:Input_ADM_ORDEN_SERVICIO_DETALLE): ADM_ORDEN_SERVICIO_DETALLE
        anularADM_ORDEN_SERVICIO_DETALLE(id_orden_servicio_detalle: Int!): ADM_ORDEN_SERVICIO_DETALLE
    }

    type ADM_ORDEN_SERVICIO_DETALLE {
        id_orden_servicio_detalle: Int!
        id_orden_servicio: Int
        d_fecha_servicio: DateTime
        c_hora_servicio: String
        id_tarifario_segus: Int
        codigo_segus: String
        id_profesional: Int
        n_precio: Int
        n_cantidad: Int
        n_parcial: Int
        n_descuento: Int
        n_auditoria: Int
        t_auditoria_obs: String
        n_total: Int
        n_paciente: Int
        n_garante: Int
        n_copago_variable: Int
        n_copago_fijo: Int
        f_copago_variable: Int
        n_impuesto: Int
        f_afecto: Int
        f_estado: Int
        id_habitacion_i: Int
        d_fecha_inicio: DateTime
        c_hora_inicio: String
        d_fecha_final: DateTime
        c_hora_final: String
        id_habitacion_f: Int
        d_fecha_registro: DateTime
        d_fecha_modifica: DateTime
        id_user_registro: Int
        id_user_modifica: Int
        orden_servicio: ADM_ORDEN_SERVICIO
        resultado_lab: [resultado_lab]
    }

    input Input_ADM_ORDEN_SERVICIO_DETALLE {        
        id_orden_servicio: Int
        d_fecha_servicio: DateTime
        c_hora_servicio: String
        id_tarifario_segus: Int
        codigo_segus: String
        id_profesional: Int
        n_precio: Int
        n_cantidad: Int
        n_parcial: Int
        n_descuento: Int
        n_auditoria: Int
        t_auditoria_obs: String
        n_total: Int
        n_paciente: Int
        n_garante: Int
        n_copago_variable: Int
        n_copago_fijo: Int
        f_copago_variable: Int
        n_impuesto: Int
        f_afecto: Int
        f_estado: Int
        id_habitacion_i: Int
        d_fecha_inicio: DateTime
        c_hora_inicio: String
        d_fecha_final: DateTime
        c_hora_final: String
        id_habitacion_f: Int
        d_fecha_registro: DateTime
        d_fecha_modifica: DateTime
        id_user_registro: Int
        id_user_modifica: Int
    }
    ${DateTimeTypeDefinition}
    ${DateTypeDefinition}

`

interface I_ADM_ORDEN_SERVICIO_DETALLE {
    id_orden_servicio: number,
    d_fecha_servicio: Date,
    c_hora_servicio: string,
    id_tarifario_segus: number,
    codigo_segus: string,
    id_profesional: number,
    n_precio: number,
    n_cantidad: number,
    n_parcial: number,
    n_descuento: number,
    n_auditoria: number,
    t_auditoria_obs: string,
    n_total: number,
    n_paciente: number,
    n_garante: number,
    n_copago_variable: number,
    n_copago_fijo: number,
    f_copago_variable: number,
    n_impuesto: number,
    f_afecto: number,
    f_estado: number,
    id_habitacion_i: number,
    d_fecha_inicio: Date,
    c_hora_inicio: string,
    d_fecha_final: Date,
    c_hora_final: string,
    id_habitacion_f: number,
    d_fecha_registro: Date,
    d_fecha_modifica: Date,
    id_user_registro: number,
    id_user_modifica: number,
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getOneADM_ORDEN_SERVICIO_DETALLE: async (_parent: any, _args: { id_orden_servicio_detalle: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.aDM_ORDEN_SERVICIO_DETALLE.findUnique({
                where: {
                    id_orden_servicio_detalle: _args.id_orden_servicio_detalle
                }
            })
        },
        getFindADM_ORDEN_SERVICIO_DETALLE: async (_parent: any, _args: { id_orden_servicio: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.aDM_ORDEN_SERVICIO_DETALLE.findMany({
                where: {
                    id_orden_servicio: _args.id_orden_servicio,
                    AND: {
                        NOT: {
                            f_estado: 7
                        }
                    }
                }
            })
        }
    },
    Mutation: {
        createADM_ORDEN_SERVICIO_DETALLE: async (_parent: any, _args: { data: I_ADM_ORDEN_SERVICIO_DETALLE }, context: Context) => {
            const userId = getUserId(context)
            const validaDuplicadoSegus = await context.prisma.aDM_ORDEN_SERVICIO_DETALLE.findMany({
                where: {
                    id_orden_servicio: _args.data.id_orden_servicio,
                    id_tarifario_segus: _args.data.id_tarifario_segus
                }
            })
            if (validaDuplicadoSegus.length > 0) {
                throw new Error('Ya existe un registro con el mismo servicio')
            }

            return await context.prisma.aDM_ORDEN_SERVICIO_DETALLE.create({
                data: {
                    id_orden_servicio: _args.data.id_orden_servicio,
                    d_fecha_servicio: FormatDateTimeSQLServer(new Date()),
                    c_hora_servicio: _args.data.c_hora_servicio,
                    id_tarifario_segus: _args.data.id_tarifario_segus,
                    codigo_segus: _args.data.codigo_segus,
                    id_profesional: _args.data.id_profesional,
                    n_precio: _args.data.n_precio,
                    n_cantidad: _args.data.n_cantidad,
                    n_parcial: _args.data.n_parcial,
                    n_descuento: _args.data.n_descuento,
                    n_auditoria: _args.data.n_auditoria,
                    t_auditoria_obs: _args.data.t_auditoria_obs,
                    n_total: _args.data.n_total,
                    n_paciente: _args.data.n_paciente,
                    n_garante: _args.data.n_garante,
                    n_copago_variable: _args.data.n_copago_variable,
                    n_copago_fijo: _args.data.n_copago_fijo,
                    f_copago_variable: _args.data.f_copago_variable,
                    n_impuesto: _args.data.n_impuesto,
                    f_afecto: _args.data.f_afecto,
                    f_estado: _args.data.f_estado,
                    id_habitacion_i: _args.data.id_habitacion_i,
                    // d_fecha_inicio: _args.data.d_fecha_inicio,
                    c_hora_inicio: _args.data.c_hora_inicio,
                    // d_fecha_final: _args.data.d_fecha_final,
                    c_hora_final: _args.data.c_hora_final,
                    id_habitacion_f: _args.data.id_habitacion_f,
                    d_fecha_registro: FormatDateTimeSQLServer(new Date()),
                    // d_fecha_modifica: _args.data.d_fecha_modifica,
                    id_user_registro: _args.data.id_user_registro,
                    id_user_modifica: _args.data.id_user_modifica,
                }
            })
        },
        updateADM_ORDEN_SERVICIO_DETALLE: async (_parent: any, _args: { id_orden_servicio_detalle: number, data: I_ADM_ORDEN_SERVICIO_DETALLE }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.aDM_ORDEN_SERVICIO_DETALLE.update({
                where: {
                    id_orden_servicio_detalle: _args.id_orden_servicio_detalle
                },
                data: {
                    id_orden_servicio: _args.data.id_orden_servicio,
                    d_fecha_servicio: _args.data.d_fecha_servicio ? FormatDateTimeSQLServer(new Date(_args.data.d_fecha_servicio)) : null,
                    c_hora_servicio: _args.data.c_hora_servicio,
                    id_tarifario_segus: _args.data.id_tarifario_segus,
                    codigo_segus: _args.data.codigo_segus,
                    id_profesional: _args.data.id_profesional,
                    n_precio: _args.data.n_precio,
                    n_cantidad: _args.data.n_cantidad,
                    n_parcial: _args.data.n_parcial,
                    n_descuento: _args.data.n_descuento,
                    n_auditoria: _args.data.n_auditoria,
                    t_auditoria_obs: _args.data.t_auditoria_obs,
                    n_total: _args.data.n_total,
                    n_paciente: _args.data.n_paciente,
                    n_garante: _args.data.n_garante,
                    n_copago_variable: _args.data.n_copago_variable,
                    n_copago_fijo: _args.data.n_copago_fijo,
                    f_copago_variable: _args.data.f_copago_variable,
                    n_impuesto: _args.data.n_impuesto,
                    f_afecto: _args.data.f_afecto,
                    f_estado: _args.data.f_estado,
                    id_habitacion_i: _args.data.id_habitacion_i,
                    // d_fecha_inicio: _args.data.d_fecha_inicio,
                    c_hora_inicio: _args.data.c_hora_inicio,
                    // d_fecha_final: _args.data.d_fecha_final,
                    c_hora_final: _args.data.c_hora_final,
                    id_habitacion_f: _args.data.id_habitacion_f,
                    // d_fecha_registro: _args.data.d_fecha_registro,
                    d_fecha_modifica: FormatDateTimeSQLServer(new Date()),
                    id_user_registro: _args.data.id_user_registro,
                    id_user_modifica: _args.data.id_user_modifica,
                }
            })
        },
        anularADM_ORDEN_SERVICIO_DETALLE: async (_parent: any, _args: { id_orden_servicio_detalle: number }, context: Context) => {
            const userId = getUserId(context)
            const validaFecha = await context.prisma.aDM_ORDEN_SERVICIO_DETALLE.findUnique({
                where: {
                    id_orden_servicio_detalle: _args.id_orden_servicio_detalle
                }
            })
            let { d_fecha_registro }: any = validaFecha

            if (diferenciaFechasToHoras(d_fecha_registro) > 24) {
                throw new Error('No se puede eliminar un servicio con fecha menor a la actual')
            }
            return await context.prisma.aDM_ORDEN_SERVICIO_DETALLE.update({
                where: {
                    id_orden_servicio_detalle: _args.id_orden_servicio_detalle
                },
                data: {
                    f_estado: 7
                }
            })
        }
    },
    ADM_ORDEN_SERVICIO_DETALLE: {
        orden_servicio: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.aDM_ORDEN_SERVICIO.findUnique({
                where: {
                    id_orden_servicio: _parent.id_orden_servicio
                }
            })
        },
        resultado_lab: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.aDM_ORDEN_SERVICIO_DETALLE.findUnique({
                where: {
                    id_orden_servicio_detalle: _parent.id_orden_servicio_detalle
                }
            }).resultado_lab()
        }
    }
}

export { tipeDefs as ADM_ORDEN_SERVICIO_DETALLETipeDef, resolvers as ADM_ORDEN_SERVICIO_DETALLEResolv }