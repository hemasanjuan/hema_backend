
import moment from 'moment-timezone';
import { context, Context } from '../../context';
import { FormatDateTimeSQLServer, getUserId } from "../../utils";
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from "graphql-scalars";

const tipeDefs = `#graphql

    extend type Query {
        getAllResultado_lab: [resultado_lab!]!
        getOneResultado_lab(result_lab_id: Int!): resultado_lab
        getQuantityResultadoLabByOrdenServicio(idOrdenServicio: Int!, origen: String!): Int
        getResultado_labByDocument(result_lab_n_documento: String, result_lab_id_d_examen_lab: Int, dateIni: DateTime): [resultado_lab]
        getFindResultLaboRomsoft(result_lab_id_ord_servicio_romsoft: Int, id_d_examen_lab: [Int]): [resultado_lab]
        getFindRespLaboRomsoft(id_orden_servicio: Int, id_tarifario_segus: Int): [resultado_lab]
    }

    extend type Mutation {
        createResultado_lab(data:Input_resultado_lab, origen: String): resultado_lab
        createComentario_lab(data:Input_resultado_lab, origen: String): resultado_lab
        updateResultado_lab(result_lab_id: Int!, data:Input_resultado_lab): resultado_lab
    }

    type resultado_lab {
        result_lab_id: Int
        result_lab_id_ord_servicio: Int
        result_lab_id_ord_servicio_romsoft: Int
        result_lab_id_ord_servicio_romsoft_det: Int
        result_lab_id_d_examen_lab: Int
        result_lab_n_documento: String
        result_lab_resultado: String
        result_lab_fecha_reg: DateTime
        result_lab_fecha_modi: DateTime
        result_lab_usu_reg: Int
        result_lab_usu_modi: Int
        result_lab_comentario: String
        orden_servicio_detalle: ADM_ORDEN_SERVICIO_DETALLE
        theme_d_examen_lab: d_examen_lab
    }

    input Input_resultado_lab {
        result_lab_id_ord_servicio: Int
        result_lab_id_d_examen_lab: Int
        result_lab_id_ord_servicio_romsoft: Int
        result_lab_id_ord_servicio_romsoft_det: Int
        result_lab_n_documento: String
        result_lab_resultado: String
        result_lab_fecha_reg: DateTime
        result_lab_fecha_modi: DateTime
        result_lab_usu_reg: Int
        result_lab_usu_modi: Int
        result_lab_comentario: String
        totalItems: Int
    }

    ${DateTimeTypeDefinition}
    ${DateTypeDefinition}

`

interface I_resultado_lab {
    result_lab_id_ord_servicio: number,
    result_lab_id_ord_servicio_det: number,
    result_lab_id_d_examen_lab: number,
    result_lab_id_ord_servicio_romsoft: number,
    result_lab_id_ord_servicio_romsoft_det: number,
    result_lab_n_documento: string,
    result_lab_resultado: string,
    result_lab_fecha_reg: Date,
    result_lab_fecha_modi: Date,
    result_lab_usu_reg: number,
    result_lab_usu_modi: number,
    result_lab_comentario: string,
    totalItems?: number,
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getAllResultado_lab: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.resultado_lab.findMany()
        },
        getOneResultado_lab: async (_parent: any, _args: { result_lab_id: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.resultado_lab.findUnique({
                where: {
                    result_lab_id: _args.result_lab_id
                }
            })
        },
        getQuantityResultadoLabByOrdenServicio: async (_parent: any, _args: { idOrdenServicio: number, origen: string }, context: Context) => {
            if (_args.origen === "L")
                return await context.prisma.resultado_lab.count({
                    where: {
                        ADM_ORDEN_SERVICIO_DETALLE: { id_orden_servicio: _args.idOrdenServicio }
                    }
                })
            return await context.prisma.resultado_lab.count({
                where: {
                    result_lab_id_ord_servicio_romsoft: _args.idOrdenServicio
                }
            })
        },
        getResultado_labByDocument: async (_parent: any, _args: { result_lab_n_documento: string, result_lab_id_d_examen_lab: number, dateIni: Date }, context: Context) => {
            const userId = getUserId(context)
            const result = await context.prisma.resultado_lab.findMany({
                where: {
                    AND: [
                        {
                            result_lab_n_documento: _args.result_lab_n_documento
                        },
                        {
                            result_lab_id_d_examen_lab: _args.result_lab_id_d_examen_lab
                        },
                        {
                            result_lab_fecha_reg: {
                                // lt: _args.dateIni
                                lt: new Date(_args.dateIni).toISOString()
                            }
                        }
                    ]

                },
                orderBy: {
                    result_lab_id: 'asc'
                }
            })
            return [result[result.length - 1], result[result.length - 2]]
        },
        getFindResultLaboRomsoft: async (_parent: any, _args: { result_lab_id_ord_servicio_romsoft: number, id_d_examen_lab: number[] }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.resultado_lab.findMany({
                where: {
                    AND: [
                        {
                            result_lab_id_ord_servicio_romsoft: _args.result_lab_id_ord_servicio_romsoft
                        }, {
                            result_lab_id_d_examen_lab: {
                                in: _args.id_d_examen_lab
                            }
                        }
                    ]
                },
                orderBy: {
                    result_lab_id: 'asc'
                }
            })
        },
        getFindRespLaboRomsoft: async (_parent: any, _args: { id_orden_servicio: number, id_tarifario_segus: number }, context: Context) => {
            const userId = getUserId(context)
            if (_args.id_orden_servicio < 0) return []
            return await context.prisma.resultado_lab.findMany({

                where: {
                    d_examen_lab: {
                        d_exam_lab_cod_segusID: _args.id_tarifario_segus
                    },
                    result_lab_id_ord_servicio_romsoft: _args.id_orden_servicio
                }
            })
        }
    },
    Mutation: {
        createComentario_lab: async (_parent: any, _args: { data: I_resultado_lab, origen: string }, context: Context) => {
            const userId = getUserId(context)
            const now = moment()
            if (_args.origen === 'R') {
                const existingRecord = await context.prisma.resultado_lab.findMany({
                    where: {
                        AND: [
                            {
                                result_lab_id_ord_servicio_romsoft: _args.data.result_lab_id_ord_servicio
                            },
                            {
                                result_lab_id_d_examen_lab: _args.data.result_lab_id_d_examen_lab
                            }
                        ]
                    }
                })
                if (existingRecord.length > 0) {
                    return await context.prisma.resultado_lab.update({
                        where: {
                            result_lab_id: existingRecord[0].result_lab_id
                        },
                        data: {
                            result_lab_comentario: _args.data.result_lab_comentario,
                        }
                    })
                } else {
                    return await context.prisma.resultado_lab.create({
                        data: {
                            result_lab_id_ord_servicio_romsoft: _args.data.result_lab_id_ord_servicio,
                            result_lab_id_d_examen_lab: _args.data.result_lab_id_d_examen_lab,
                            result_lab_resultado: "",
                            result_lab_comentario: _args.data.result_lab_comentario,
                            result_lab_fecha_reg: FormatDateTimeSQLServer(now.format()),//FormatDateTimeSQLServer(now.format())
                            result_lab_usu_reg: userId
                        }
                    })
                }
            }
            if (_args.origen === 'L') {
                const existingRecord = await context.prisma.resultado_lab.findMany({
                    where: {
                        AND: [
                            {
                                result_lab_id_ord_servicio: _args.data.result_lab_id_ord_servicio
                            },
                            {
                                result_lab_id_d_examen_lab: _args.data.result_lab_id_d_examen_lab
                            }
                        ]
                    }
                })
                if (existingRecord.length > 0) {
                    return await context.prisma.resultado_lab.update({
                        where: {
                            result_lab_id: existingRecord[0].result_lab_id
                        },
                        data: {
                            result_lab_comentario: _args.data.result_lab_comentario,
                        }
                    })
                } else {
                    return await context.prisma.resultado_lab.create({
                        data: {
                            result_lab_id_ord_servicio: _args.data.result_lab_id_ord_servicio,
                            result_lab_id_d_examen_lab: _args.data.result_lab_id_d_examen_lab,
                            result_lab_resultado: "",
                            result_lab_comentario: _args.data.result_lab_comentario,
                            result_lab_fecha_reg: FormatDateTimeSQLServer(now.format()),
                            result_lab_usu_reg: userId
                        }
                    })
                }
            }
        },
        createResultado_lab: async (_parent: any, _args: { data: I_resultado_lab, origen: string }, context: Context) => {
            const userId = getUserId(context)
            const now = moment()
            if (_args.origen === 'R') {
                const existingRecord = await context.prisma.resultado_lab.findMany({
                    where: {
                        AND: [
                            {
                                result_lab_id_ord_servicio_romsoft: _args.data.result_lab_id_ord_servicio,
                                result_lab_id_ord_servicio_romsoft_det: _args.data.result_lab_id_ord_servicio_det
                            },
                            {
                                result_lab_id_d_examen_lab: _args.data.result_lab_id_d_examen_lab
                            }
                        ]
                    }
                })
                if (existingRecord.length > 0) {
                    return await context.prisma.resultado_lab.update({
                        where: {
                            result_lab_id: existingRecord[0].result_lab_id
                        },
                        data: {
                            result_lab_id_ord_servicio_romsoft: _args.data.result_lab_id_ord_servicio,
                            result_lab_id_ord_servicio_romsoft_det: _args.data.result_lab_id_ord_servicio_det,
                            result_lab_id_d_examen_lab: _args.data.result_lab_id_d_examen_lab,
                            result_lab_n_documento: _args.data.result_lab_n_documento,
                            result_lab_resultado: _args.data.result_lab_resultado,
                            result_lab_comentario: _args.data.result_lab_comentario,
                            result_lab_fecha_modi: FormatDateTimeSQLServer(now.format()),
                            result_lab_usu_modi: userId
                        }
                    })
                } else {
                    return await context.prisma.resultado_lab.create({
                        data: {
                            result_lab_id_ord_servicio_romsoft: _args.data.result_lab_id_ord_servicio,
                            result_lab_id_ord_servicio_romsoft_det: _args.data.result_lab_id_ord_servicio_det,
                            result_lab_id_d_examen_lab: _args.data.result_lab_id_d_examen_lab,
                            result_lab_n_documento: _args.data.result_lab_n_documento,
                            result_lab_resultado: _args.data.result_lab_resultado,
                            result_lab_comentario: _args.data.result_lab_comentario,
                            result_lab_fecha_reg: FormatDateTimeSQLServer(now.format()),
                            result_lab_usu_reg: userId
                        }
                    })
                }
            }
            if (_args.origen === 'L') {
                const existingRecord = await context.prisma.resultado_lab.findMany({
                    where: {
                        AND: [
                            {
                                result_lab_id_ord_servicio: _args.data.result_lab_id_ord_servicio
                            },
                            {
                                result_lab_id_d_examen_lab: _args.data.result_lab_id_d_examen_lab
                            }
                        ]
                    }
                })
                if (existingRecord.length > 0) {
                    return await context.prisma.resultado_lab.update({
                        where: {
                            result_lab_id: existingRecord[0].result_lab_id
                        },
                        data: {
                            result_lab_id_ord_servicio: _args.data.result_lab_id_ord_servicio,
                            result_lab_id_d_examen_lab: _args.data.result_lab_id_d_examen_lab,
                            result_lab_n_documento: _args.data.result_lab_n_documento,
                            result_lab_resultado: _args.data.result_lab_resultado,
                            result_lab_comentario: _args.data.result_lab_comentario,
                            result_lab_fecha_modi: FormatDateTimeSQLServer(now.format()),
                            result_lab_usu_modi: userId
                        }
                    })
                } else {
                    return await context.prisma.resultado_lab.create({
                        data: {
                            result_lab_id_ord_servicio: _args.data.result_lab_id_ord_servicio,
                            result_lab_id_d_examen_lab: _args.data.result_lab_id_d_examen_lab,
                            result_lab_n_documento: _args.data.result_lab_n_documento,
                            result_lab_resultado: _args.data.result_lab_resultado,
                            result_lab_comentario: _args.data.result_lab_comentario,
                            result_lab_fecha_reg: FormatDateTimeSQLServer(now.format()),
                            result_lab_usu_reg: userId
                        }
                    })
                }
            }
        },

        updateResultado_lab: async (_parent: any, _args: { result_lab_id: number, data: I_resultado_lab }, context: Context) => {
            const userId = getUserId(context)
            const now = moment()
            return await context.prisma.resultado_lab.update({
                where: {
                    result_lab_id: _args.result_lab_id
                },
                data: {
                    result_lab_id_ord_servicio: _args.data.result_lab_id_ord_servicio,
                    result_lab_id_d_examen_lab: _args.data.result_lab_id_d_examen_lab,
                    result_lab_n_documento: _args.data.result_lab_n_documento,
                    result_lab_resultado: _args.data.result_lab_resultado,
                    result_lab_comentario: _args.data.result_lab_comentario,
                    result_lab_fecha_modi: FormatDateTimeSQLServer(now.format()),
                    result_lab_usu_modi: _args.data.result_lab_usu_modi
                }
            })
        }
    },
    resultado_lab: {
        orden_servicio_detalle: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.resultado_lab.findUnique({
                where: {
                    result_lab_id: _parent.result_lab_id
                }
            }).ADM_ORDEN_SERVICIO_DETALLE()
        },
        theme_d_examen_lab: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.resultado_lab.findUnique({
                where: {
                    result_lab_id: _parent.result_lab_id
                }
            }).d_examen_lab()
        }
    }
}

export { tipeDefs as resultado_labTipeDef, resolvers as resultado_labResolv }