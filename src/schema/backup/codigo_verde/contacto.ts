
import { context, Context } from '../../context';
import { FormatDateTimeSQLServer, getUserId } from "../../utils";
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from 'graphql-scalars';
import { Prisma } from "@prisma/client";

const tipeDefs = `#graphql

    extend type Query {
        getAllContacto(tipoContacto: [Int], search: String, byUser: Boolean): [contacto!]!
        getOneContacto(contac_id: Int): contacto
        findAllContacto(tipoContacto: [Int], where: contactoWhereInput): [contacto!]!
    }

    extend type Mutation {
        createContacto(data:ContactoInput,contac_usuario_reg: Int!): contacto
        updateContacto(contac_id: Int!, data:ContactoInput, contac_usuario_update:Int): contacto
    }

    type contacto {
        contac_id: Int!
        contac_persona: Int!
        contac_tipo: Int!
        contac_fech_reg: DateTime
        contac_fech_update: DateTime
        contac_usuario_reg: Int
        contac_usuario_update: Int
        contac_token_dni: String
        persona: persona!
        tipoContacto: tipo_contacto!
        detalleEntidad: [detalle_entidad!]!
        visitaVentas: [visita_ventas!]!
    }

    input ContactoInput {
        contac_persona: Int,
        contac_tipo: Int
    }

    input contactoWhereInput {
        persona: personaWhereInput
    }

    input personaWhereInput {
        per_nro_doc: StringNullableFilter
        per_nombre_completo: StringNullableFilter
        per_cel: StringNullableFilter
    }

    input StringNullableFilter {
        equals: String
        in: [String]
        notIn: [String]
        lt: String
        lte: String
        gt: String
        gte: String
        contains: String
        startsWith: String
        endsWith: String
        not: String
    }
    
    scalar DateTime
`

interface dataContacto {
    contac_persona: number,
    contac_tipo: number,
}
const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getAllContacto: async (_parent: any, _args: { tipoContacto: [], search: string, byUser: boolean }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.contacto.findMany({
                where: {
                    AND: [
                        {
                            OR: [
                                {
                                    persona: {
                                        per_nro_doc: {
                                            contains: _args.search
                                        }
                                    }
                                },
                                {
                                    persona: {
                                        per_nombre_completo: {
                                            contains: _args.search
                                        }
                                    }
                                },
                                {
                                    persona: {
                                        per_cel: {
                                            contains: _args.search
                                        }
                                    }
                                },
                            ]
                        },
                        {
                            contac_tipo: {
                                in: _args.tipoContacto || []
                            }
                        },
                        {
                            contac_usuario_reg: _args.byUser === true ? userId : undefined
                        }
                    ]
                }
            })
        },
        getOneContacto: async (_parent: any, _args: { contac_id: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.contacto.findUnique({
                where: {
                    contac_id: _args.contac_id
                }
            })
        },
        // findAllContacto: async (_parent: any, _args: { tipoContacto: [], where: Prisma.contactoWhereInput }, context: Context) => {
        //     const userId = getUserId(context)
        //     return await context.prisma.contacto.findMany({
        //         where: {
        //             AND: [
        //                 _args.where,
        //                 {
        //                     contac_tipo: {
        //                         in: _args.tipoContacto || []
        //                     }
        //                 },
        //                 // {
        //                 //     contac_usuario_reg: userId
        //                 // }
        //             ]
        //         }
        //     })
        // }
    },
    Mutation: {
        createContacto: async (_parent: any, args: { data: dataContacto, contac_usuario_reg: number }, context: Context) => {
            const userId = getUserId(context)

            return await context.prisma.contacto.create({
                data: {
                    contac_persona: args.data.contac_persona,
                    contac_tipo: args.data.contac_tipo,
                    contac_usuario_reg: userId,
                    contac_fech_reg: FormatDateTimeSQLServer(new Date())
                }
            })
        },
        updateContacto: async (_parent: any, args: { contac_id: number, data: dataContacto, contac_usuario_update: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.contacto.update({
                where: {
                    contac_id: args.contac_id
                },
                data: {
                    contac_persona: args.data.contac_persona,
                    contac_tipo: args.data.contac_tipo,
                    contac_fech_update: FormatDateTimeSQLServer(new Date()),
                    contac_usuario_update: userId
                }
            })
        }
    },
    contacto: {
        persona: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.contacto.findUnique({
                where: {
                    contac_id: _parent.contac_id
                }
            }).persona()
        },
        tipoContacto: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.contacto.findUnique({
                where: {
                    contac_id: _parent.contac_id
                }
            }).tipo_contacto()
        },
        detalleEntidad: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.contacto.findUnique({
                where: {
                    contac_id: _parent.contac_id
                }
            }).detalle_entidad()
        },
        visitaVentas: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.contacto.findUnique({
                where: {
                    contac_id: _parent.contac_id
                }
            }).visita_ventas()
        }
    }
}


export { tipeDefs as contactoTipeDef, resolvers as contactoResolv }