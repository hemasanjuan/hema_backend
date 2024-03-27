
import { context, Context } from '../../context'
import { getUserId } from "../../utils";


const tipeDefs = `#graphql

    extend type Query {
        getAllEmpresa: [empresa!]!
        getSelectEmpresa: [empresa!]!
    }

    extend type Mutation {
        createEmpresa(c_codigo: String!, t_descripcion: String!, t_observacion:String!, f_activo: Boolean!): empresa
    }

    type empresa {
        id_empresa: Int!
        c_codigo: String!
        t_descripcion: String!
        t_observacion: String
        f_activo: Boolean!
    }

`

const resolvers = {
    Query: {
        getAllEmpresa: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.empresa.findMany()
        },
        getSelectEmpresa: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.empresa.findMany({
                where: {
                    id_empresa: {
                        in: [1, 5, 6]
                    }
                }
            })
        }
    },
    Mutation: {
        createEmpresa: async (_parent: any, _args: { c_codigo: string, t_descripcion: string, t_observacion: string, f_activo: boolean }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.empresa.create({
                data: {
                    c_codigo: _args.c_codigo,
                    t_descripcion: _args.t_descripcion,
                    t_observacion: _args.t_observacion,
                    f_activo: _args.f_activo
                }
            })
        }
    }
}

export { tipeDefs as empresaTipeDef, resolvers as empresaResolv }