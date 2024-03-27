
import { context, Context } from '../../context';
import { FormatDateTimeSQLServer, getUserId } from "../../utils";
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from "graphql-scalars";

const tipeDefs = `#graphql

    extend type Query {
        getAllTipo_paciente: [tipo_paciente!]!
        getOneTipo_paciente(id_tipo_paciente: Int!): tipo_paciente
    }

    type tipo_paciente {
        id_tipo_paciente: Int!
        c_codigo: String
        t_descripcion: String
        t_observacion: String
        f_activo: Boolean
    }

    input Input_tipo_paciente {
        c_codigo: String
        t_descripcion: String
        t_observacion: String
        f_activo: Boolean
    }

    ${DateTimeTypeDefinition}
    ${DateTypeDefinition}

`

interface I_tipo_paciente {
    c_codigo: string,
    t_descripcion: string,
    t_observacion: string,
    f_activo: boolean,
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getOneTipo_paciente: async (_parent: any, _args: { id_tipo_paciente: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tipo_paciente.findUnique({
                where: {
                    id_tipo_paciente: _args.id_tipo_paciente
                }
            })
        },
        getAllTipo_paciente: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tipo_paciente.findMany({
                orderBy: {
                    id_tipo_paciente: 'desc'
                }
            })
        }
    },
}

export { tipeDefs as tipo_pacienteTipeDef, resolvers as tipo_pacienteResolv }