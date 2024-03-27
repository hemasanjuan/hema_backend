
import { context, Context } from '../../context';
import { FormatDateTimeSQLServer, getUserId } from "../../utils";
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from "graphql-scalars";
import { atencionResolv } from '../atencion/atencion';

const tipeDefs = `#graphql

    extend type Query {
        getAllADM_ORDEN_SERVICIO(id_sucursal: Int, search: String): [ADM_ORDEN_SERVICIO!]!
        getFindAtencionADM_ORDEN_SERVICIO(id_atencion: Int!, origen: String): [ADM_ORDEN_SERVICIO!]!
        getOneADM_ORDEN_SERVICIO(id_orden_servicio: Int!): ADM_ORDEN_SERVICIO
    }

    extend type Mutation {
        createADM_ORDEN_SERVICIO(data:Input_ADM_ORDEN_SERVICIO): ADM_ORDEN_SERVICIO
        updateADM_ORDEN_SERVICIO(id_orden_servicio: Int!, data:Input_ADM_ORDEN_SERVICIO): ADM_ORDEN_SERVICIO
    }

    type ADM_ORDEN_SERVICIO {
        id_orden_servicio: Int!
        id_atencion_romsoft: Int
        id_atencion: Int
        id_sucursal: Int
        n_total: Int
        n_paciente: Int
        n_documento: String
        n_garante: Int
        t_observacion: String
        f_facturado: Int
        id_factura: Int
        f_estado: Int
        f_envio: Int
        f_resultado: Int
        id_user_registro: Int
        id_user_modifica: Int
        d_fecha_registro: DateTime
        d_fecha_modifica: DateTime
        detalle_servicio: [ADM_ORDEN_SERVICIO_DETALLE!]!
        TabSucursal: TabSucursal
        atencion: atencion
    }

    input Input_ADM_ORDEN_SERVICIO {
        id_atencion: Int
        id_atencion_romsoft: Int
        id_sucursal: Int
        n_total: Int
        n_paciente: Int
        n_documento: String
        n_garante: Int
        t_observacion: String
        f_facturado: Int
        id_factura: Int
        f_estado: Int
        f_envio: Int
        f_resultado: Int
    }
    ${DateTimeTypeDefinition}
    ${DateTypeDefinition}

`

interface I_ADM_ORDEN_SERVICIO {
    id_atencion: number,
    id_atencion_romsoft: number,
    id_sucursal: number,
    n_total: number,
    n_paciente: number,
    n_documento: string,
    n_garante: number,
    t_observacion: string,
    f_facturado: number,
    id_factura: number,
    f_estado: number,
    f_envio: number,
    f_resultado: number,
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getFindAtencionADM_ORDEN_SERVICIO: async (_parent: any, _args: { id_atencion: number, origen: string }, context: Context) => {
            const userId = getUserId(context)
            if (_args.origen == 'R')
                return await context.prisma.aDM_ORDEN_SERVICIO.findMany({
                    where: {
                        id_atencion_romsoft: _args.id_atencion
                    }
                })
            else
                return await context.prisma.aDM_ORDEN_SERVICIO.findMany({
                    where: {
                        id_atencion: _args.id_atencion
                    }
                })
        },
        getOneADM_ORDEN_SERVICIO: async (_parent: any, _args: { id_orden_servicio: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.aDM_ORDEN_SERVICIO.findUnique({
                where: {
                    id_orden_servicio: _args.id_orden_servicio
                }
            })
        },
        getAllADM_ORDEN_SERVICIO: async (_parent: any, _args: { id_sucursal: number, search: string }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.aDM_ORDEN_SERVICIO.findMany({
                where: {
                    AND: [
                        {
                            id_sucursal: _args.id_sucursal
                        },
                        {
                            OR: [
                                {
                                    ATENCION: {
                                        persona: {
                                            per_nro_doc: {
                                                contains: _args.search
                                            }
                                        }
                                    }
                                },
                                {
                                    ATENCION: {
                                        persona: {
                                            per_nombre_completo: {
                                                contains: _args.search
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                },
                orderBy: {
                    d_fecha_registro: 'desc'
                }
            })
        }
    },
    Mutation: {
        createADM_ORDEN_SERVICIO: async (_parent: any, _args: { data: I_ADM_ORDEN_SERVICIO }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.aDM_ORDEN_SERVICIO.create({
                data: {
                    id_atencion: _args.data.id_atencion,
                    id_atencion_romsoft: _args.data.id_atencion_romsoft,
                    id_sucursal: _args.data.id_sucursal,
                    n_total: _args.data.n_total,
                    n_paciente: _args.data.n_paciente,
                    n_documento: _args.data.n_documento,
                    n_garante: _args.data.n_garante,
                    t_observacion: _args.data.t_observacion,
                    f_facturado: _args.data.f_facturado,
                    id_factura: _args.data.id_factura,
                    f_estado: 3,
                    id_user_registro: userId,
                    d_fecha_registro: FormatDateTimeSQLServer(new Date()),
                    f_resultado: 0,
                    f_envio: 0
                }
            })
        },
        updateADM_ORDEN_SERVICIO: async (_parent: any, _args: { id_orden_servicio: number, data: I_ADM_ORDEN_SERVICIO }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.aDM_ORDEN_SERVICIO.update({
                where: {
                    id_orden_servicio: _args.id_orden_servicio
                },
                data: {
                    id_atencion: _args.data.id_atencion,
                    id_atencion_romsoft: _args.data.id_atencion_romsoft,
                    id_sucursal: _args.data.id_sucursal,
                    n_total: _args.data.n_total,
                    n_paciente: _args.data.n_paciente,
                    n_documento: _args.data.n_documento,
                    n_garante: _args.data.n_garante,
                    t_observacion: _args.data.t_observacion,
                    f_facturado: _args.data.f_facturado,
                    id_factura: _args.data.id_factura,
                    f_estado: _args.data.f_estado,
                    id_user_modifica: userId,
                    d_fecha_modifica: FormatDateTimeSQLServer(new Date())
                }
            })
        }
    },
    ADM_ORDEN_SERVICIO: {
        detalle_servicio: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.aDM_ORDEN_SERVICIO_DETALLE.findMany({
                where: {
                    id_orden_servicio: _parent.id_orden_servicio
                }
            })
        },
        TabSucursal: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.tabSucursal.findUnique({
                where: {
                    IdSucursal: _parent.id_sucursal
                }
            })
        },
        atencion: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.aTENCION.findUnique({
                where: {
                    id_atencion: _parent.id_atencion
                }
            })
        }
    }
}

export { tipeDefs as ADM_ORDEN_SERVICIOTipeDef, resolvers as ADM_ORDEN_SERVICIOResolv }