
import { context, Context } from '../../context';
import { FormatDateTimeSQLServer, getUserId } from "../../utils";
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from "graphql-scalars";

const tipeDefs = `#graphql

    extend type Query {
        getOneD_examen_lab(d_exam_lab_id: Int!): d_examen_lab
        findD_examen_lab(d_exam_lab_cod_segusID: Int!): [d_examen_lab]
    }

    extend type Mutation {
        createD_examen_lab(data:Input_d_examen_lab): d_examen_lab
        updateD_examen_lab(d_exam_lab_id: Int!, data:Input_Update_d_examen_lab): d_examen_lab
    }

    type d_examen_lab {
        d_exam_lab_id: Int!
        d_exam_lab_cod_segusID: Int!
        d_exam_lab_cod_segus: String!
        d_exam_lab_ord: Int!
        d_exam_lab_desc: String!
        d_exam_lab_obs: String
        d_exam_lab_tipo: String!
        d_exam_lad_config: String
        d_exam_lab_estado: Int
        d_exam_lab_fecha_registro: DateTime
        d_exam_lab_fecha_modifica: DateTime
        d_exam_lab_user_registro: Int
        d_exam_lab_user_modifica: Int
        resultado_lab: [resultado_lab]
    }

    input Input_d_examen_lab {
        d_exam_lab_cod_segusID: Int!
        d_exam_lab_cod_segus: String!
        d_exam_lab_ord: Int!
        d_exam_lab_desc: String!
        d_exam_lab_obs: String
        d_exam_lab_estado: Int
        d_exam_lab_tipo: String!
        d_exam_lad_config: String
    }

    input Input_Update_d_examen_lab {
        d_exam_lab_cod_segusID: Int
        d_exam_lab_cod_segus: String
        d_exam_lab_ord: Int
        d_exam_lab_desc: String
        d_exam_lab_obs: String
        d_exam_lab_estado: Int
        d_exam_lab_tipo: String
        d_exam_lad_config: String
    }

    ${DateTimeTypeDefinition}
    ${DateTypeDefinition}

`

interface I_d_examen_lab {
    d_exam_lab_cod_segusID: number,
    d_exam_lab_cod_segus: string,
    d_exam_lab_ord: number,
    d_exam_lab_desc: string,
    d_exam_lab_obs: string,
    d_exam_lab_tipo: string,
    d_exam_lad_config: string    
    d_exam_lab_estado: number,
    d_exam_lab_fecha_registro: Date,
    d_exam_lab_fecha_modifica: Date,
    d_exam_lab_user_registro: number,
    d_exam_lab_user_modifica: number,
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getOneD_examen_lab: async (_parent: any, _args: { d_exam_lab_id: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.d_examen_lab.findUnique({
                where: {
                    d_exam_lab_id: _args.d_exam_lab_id
                }
            })
        },
        findD_examen_lab: async (_parent: any, _args: { d_exam_lab_cod_segusID: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.d_examen_lab.findMany({
                where: {
                    d_exam_lab_cod_segusID: _args.d_exam_lab_cod_segusID
                }
            })
        }
    },
    Mutation: {
        createD_examen_lab: async (_parent: any, _args: { data: I_d_examen_lab }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.d_examen_lab.create({
                data: {
                    d_exam_lab_cod_segusID: _args.data.d_exam_lab_cod_segusID,
                    d_exam_lab_cod_segus: _args.data.d_exam_lab_cod_segus,
                    d_exam_lab_ord: _args.data.d_exam_lab_ord,
                    d_exam_lab_desc: _args.data.d_exam_lab_desc,
                    d_exam_lab_obs: _args.data.d_exam_lab_obs,
                    d_exam_lab_tipo: _args.data.d_exam_lab_tipo,
                    d_exam_lad_config: _args.data.d_exam_lad_config,
                    d_exam_lab_estado: _args.data.d_exam_lab_estado,
                    d_exam_lab_fecha_registro: FormatDateTimeSQLServer(new Date()),
                    d_exam_lab_user_registro: userId
                }
            })
        },
        updateD_examen_lab: async (_parent: any, _args: { d_exam_lab_id: number, data: I_d_examen_lab }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.d_examen_lab.update({
                where: {
                    d_exam_lab_id: _args.d_exam_lab_id
                },
                data: {
                    d_exam_lab_cod_segusID: _args.data.d_exam_lab_cod_segusID,
                    d_exam_lab_cod_segus: _args.data.d_exam_lab_cod_segus,
                    d_exam_lab_ord: _args.data.d_exam_lab_ord,
                    d_exam_lab_desc: _args.data.d_exam_lab_desc,
                    d_exam_lab_obs: _args.data.d_exam_lab_obs,
                    d_exam_lab_tipo: _args.data.d_exam_lab_tipo,
                    d_exam_lad_config: _args.data.d_exam_lad_config,
                    d_exam_lab_estado: _args.data.d_exam_lab_estado,
                    d_exam_lab_fecha_modifica: FormatDateTimeSQLServer(new Date()),
                    d_exam_lab_user_modifica: userId
                }
            })
        }
    },
    d_examen_lab: {
        resultado_lab: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.d_examen_lab.findUnique({
                where: {
                    d_exam_lab_id: _parent.d_exam_lab_id
                }
            }).resultado_lab()
        }
    }
}

export { tipeDefs as d_examen_labTipeDef, resolvers as d_examen_labResolv }