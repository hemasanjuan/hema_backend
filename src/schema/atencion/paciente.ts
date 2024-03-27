
import { context, Context } from '../../context';
import { FormatDateTimeSQLServer, getUserId } from "../../utils";
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from "graphql-scalars";

const tipeDefs = `#graphql

    extend type Query {
        getAllPACIENTE: [PACIENTE!]!
        getOnePACIENTE(id_paciente: Int!): PACIENTE
    }

    extend type Mutation {
        createPACIENTE(data:Input_PACIENTE): PACIENTE
        updatePACIENTE(id_paciente: Int!, data:Input_PACIENTE): PACIENTE
    }

    type PACIENTE {
        id_paciente: Int!,
        id_empresa: Int,
        t_apellido_paterno: String,
        t_apellido_materno: String,
        t_nombres: String,
        t_nombre_paciente: String,
        id_tipo_documento: Int,
        c_numero_documento: String,
        c_numero_historia: String,
        d_fecha_nacimiento: DateTime,
        id_genero: Int,
        f_activo: Boolean,
        t_lugar_nacimiento: String,
        t_nacionalidad: String,
        t_domicilio_1: String,
        t_domicilio_2: String,
        t_email: String,
        t_correo_electronico: String,
        t_alergias: String,
        c_numero_fono1: String,
        c_numero_fono2: String,
        c_numero_celular1: String,
        c_numero_celular2: String,
        id_tipo_ocupacion: Int,
        t_ocupacion: String,
        id_estado_civil: Int,
        id_grupo_sanguineo: Int,
        FechaReg: DateTime,
        Acceso: Boolean,
        IdPais: Int,
    }

    input Input_PACIENTE {
        id_empresa: Int,
        t_apellido_paterno: String,
        t_apellido_materno: String,
        t_nombres: String,
        t_nombre_paciente: String,
        id_tipo_documento: Int,
        c_numero_documento: String,
        c_numero_historia: String,
        d_fecha_nacimiento: DateTime,
        id_genero: Int,
        f_activo: Boolean,
        t_lugar_nacimiento: String,
        t_nacionalidad: String,
        t_domicilio_1: String,
        t_domicilio_2: String,
        t_email: String,
        t_correo_electronico: String,
        t_alergias: String,
        c_numero_fono1: String,
        c_numero_fono2: String,
        c_numero_celular1: String,
        c_numero_celular2: String,
        id_tipo_ocupacion: Int,
        t_ocupacion: String,
        id_estado_civil: Int,
        id_grupo_sanguineo: Int,
        FechaReg: DateTime,
        Acceso: Boolean,
        IdPais: Int,
    }

    ${DateTimeTypeDefinition}
    ${DateTypeDefinition}

`

interface I_PACIENTE {
    id_empresa: number,
    t_apellido_paterno: string,
    t_apellido_materno: string,
    t_nombres: string,
    t_nombre_paciente: string,
    id_tipo_documento: number,
    c_numero_documento: string,
    c_numero_historia: string,
    d_fecha_nacimiento: Date,
    id_genero: number,
    f_activo: boolean,
    t_lugar_nacimiento: string,
    t_nacionalidad: string,
    t_domicilio_1: string,
    t_domicilio_2: string,
    t_email: string,
    t_correo_electronico: string,
    t_alergias: string,
    c_numero_fono1: string,
    c_numero_fono2: string,
    c_numero_celular1: string,
    c_numero_celular2: string,
    id_tipo_ocupacion: number,
    t_ocupacion: string,
    id_estado_civil: number,
    id_grupo_sanguineo: number,
    FechaReg: Date,
    Acceso: boolean,
    IdPais: number,
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getOnePACIENTE: async (_parent: any, _args: { id_paciente: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.pACIENTE.findUnique({
                where: {
                    id_paciente: _args.id_paciente
                }
            })
        },
        getAllPACIENTE: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.pACIENTE.findMany({
                orderBy: {
                    id_paciente: 'desc'
                }
            })
        }
    },
    Mutation: {
        createPACIENTE: async (_parent: any, _args: { data: I_PACIENTE }, context: Context) => {
            const userId = getUserId(context)
            const { data } = _args
            return await context.prisma.pACIENTE.create({
                data
            })
        },
        updatePACIENTE: async (_parent: any, _args: { id_paciente: number, data: I_PACIENTE }, context: Context) => {
            const userId = getUserId(context)
            const { data } = _args
            return await context.prisma.pACIENTE.update({
                where: {
                    id_paciente: _args.id_paciente
                },
                data
            })
        }
    },
}

export { tipeDefs as PACIENTETipeDef, resolvers as PACIENTEResolv }