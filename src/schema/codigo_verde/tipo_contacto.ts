
import { context, Context } from '../../context'
import { getUserId } from "../../utils";

const tipeDefs = `#graphql

    extend type Query {
        getAllTipoContacto: [tipo_contacto!]!
        getOneTipoContacto(tcontac_id: Int): tipo_contacto
    }

    extend type Mutation {
        createTipoContacto(tcontac_desc: String!): tipo_contacto
        updateTipoContacto(tcontac_id : Int!, tcontac_desc: String!): tipo_contacto
    }

    type tipo_contacto {
        tcontac_id: Int!
        tcontac_desc: String!
        contacto: [contacto!]!
    }
`

const resolvers = {
    Query: {
        getAllTipoContacto: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tipo_contacto.findMany()
        },
        getOneTipoContacto: async (_parent: any, _args: { tcontac_id: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tipo_contacto.findUnique({
                where: {
                    tcontac_id: _args.tcontac_id
                }
            })
        }
    },
    Mutation: {
        createTipoContacto: async (_parent: any, args: { tcontac_desc : string }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tipo_contacto.create({
                data: {
                    tcontac_desc: args.tcontac_desc
                }
            })
        },
        updateTipoContacto: async (_parent: any, args: { tcontac_id: number, tcontac_desc : string }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tipo_contacto.update({
                where: {
                    tcontac_id: args.tcontac_id
                },
                data: {
                    tcontac_desc: args.tcontac_desc
                }
            })
        }
    },
    tipo_contacto: {
        contacto: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tipo_contacto.findUnique({
                where: {
                    tcontac_id: _parent.tcontac_id
                }
            }).contacto()
        }
    }
}


export { tipeDefs as tipoContactoTipeDef, resolvers as tipoContactoResolv }