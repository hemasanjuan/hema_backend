
import { context, Context } from '../../context';
import { FormatDateTimeSQLServer, getUserId } from "../../utils";
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from "graphql-scalars";

const tipeDefs = `#graphql

    extend type Query {
        getAllTipo_atencion: [tipo_atencion!]!
        getOneTipo_atencion(id_tipo_atencion: Int!): tipo_atencion
    }

    type tipo_atencion {
        id_tipo_atencion: Int!
        c_codigo: String
        t_descripcion: String
        t_observacion: String
        f_activo: Boolean
    }

    input Input_tipo_atencion {
        c_codigo: String
        t_descripcion: String
        t_observacion: String
        f_activo: Boolean
    }

    ${DateTimeTypeDefinition}
    ${DateTypeDefinition}

`

interface I_tipo_atencion {
    c_codigo: string,
    t_descripcion: string,
    t_observacion: string,
    f_activo: boolean,
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getOneTipo_atencion: async (_parent: any, args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tipo_atencion.findUnique({
                where: {
                    id_tipo_atencion: args.id_tipo_atencion
                }
            })
        },
        getAllTipo_atencion: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tipo_atencion.findMany()
        }
    },
}

export { tipeDefs as tipo_atencionTipeDef, resolvers as tipo_atencionResolv }