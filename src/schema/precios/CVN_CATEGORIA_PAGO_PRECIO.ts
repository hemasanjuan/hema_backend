
import { context, Context } from '../../context';
import { FormatDateTimeSQLServer, getUserId } from "../../utils";
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from "graphql-scalars";
import { atencionResolv } from '../atencion/atencion';

const tipeDefs = `#graphql

    extend type Query {
        getAllCVN_CATEGORIA_PAGO_PRECIO: [CVN_CATEGORIA_PAGO_PRECIO!]!
        getOneCVN_CATEGORIA_PAGO_PRECIO(id_tarifario_segus: Int!): CVN_CATEGORIA_PAGO_PRECIO
    }

    extend type Mutation {
        setCVN_CATEGORIA_PAGO_PRECIO(id_tarifario_segus: Int!, data:Input_CVN_CATEGORIA_PAGO_PRECIO): CVN_CATEGORIA_PAGO_PRECIO
    }

    type CVN_CATEGORIA_PAGO_PRECIO {
        id_categoria_pago_precio: Int!
        id_categoria_pago: Int
        id_tarifario_segus: Int
        n_precio_usd: Int
        n_precio_sol: Int
        f_estado: Int
        id_user_registro: Int
        id_user_modifica: Int
        d_fecha_registro: DateTime
        d_fecha_modifica: DateTime
        usu_acceso_registro: Int
        usu_acceso_modifica: Int
    }

    input Input_CVN_CATEGORIA_PAGO_PRECIO {
        id_categoria_pago: Int
        id_tarifario_segus: Int
        n_precio_usd: Int
        n_precio_sol: Int
        f_estado: Int
    }
    ${DateTimeTypeDefinition}
    ${DateTypeDefinition}

`

interface I_CVN_CATEGORIA_PAGO_PRECIO {
    id_categoria_pago: number,
    id_tarifario_segus: number,
    n_precio_usd: number,
    n_precio_sol: number,
    f_estado: number,
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getOneCVN_CATEGORIA_PAGO_PRECIO: async (_parent: any, _args: { id_tarifario_segus: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.cVN_CATEGORIA_PAGO_PRECIO.findFirst({
                where: {
                    AND: [
                        { id_tarifario_segus: _args.id_tarifario_segus },
                        { id_categoria_pago: 28 }
                    ]
                }
            })
        },
        getAllCVN_CATEGORIA_PAGO_PRECIO: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.cVN_CATEGORIA_PAGO_PRECIO.findMany()
        }
    },
    Mutation: {
        setCVN_CATEGORIA_PAGO_PRECIO: async (_parent: any, _args: { id_tarifario_segus: number, data: I_CVN_CATEGORIA_PAGO_PRECIO }, context: Context) => {
            const userId = getUserId(context)
            const { id_tarifario_segus, data } = _args
            const { n_precio_usd, n_precio_sol, f_estado } = data

            const validaSegus = await context.prisma.cVN_CATEGORIA_PAGO_PRECIO.findFirst({
                where: {
                    AND: [
                        { id_tarifario_segus: id_tarifario_segus },
                        { id_categoria_pago: 28 }
                    ]
                }
            });

            if (!validaSegus) {
                const dataCatPagoPrecio = await context.prisma.cVN_CATEGORIA_PAGO_PRECIO.create({
                    data: {
                        id_categoria_pago: 28,
                        id_tarifario_segus: id_tarifario_segus,
                        n_precio_usd,
                        n_precio_sol,
                        f_estado,
                        d_fecha_registro: FormatDateTimeSQLServer(new Date()),
                        usu_acceso_registro: userId,
                    }
                })
                return dataCatPagoPrecio
            }

            const dataCatPagoPrecio = await context.prisma.cVN_CATEGORIA_PAGO_PRECIO.update({
                where: {
                    id_categoria_pago_precio: validaSegus.id_categoria_pago_precio
                },
                data: {
                    id_categoria_pago: 28,
                    n_precio_usd,
                    n_precio_sol,
                    f_estado: f_estado,
                    d_fecha_modifica: FormatDateTimeSQLServer(new Date()),
                    usu_acceso_modifica: userId
                }
            })
            return dataCatPagoPrecio
        }
    },
}

export { tipeDefs as CVN_CATEGORIA_PAGO_PRECIOTipeDef, resolvers as CVN_CATEGORIA_PAGO_PRECIOResolv }