
import { context, Context } from '../../context';
import { DateTimeResolver } from 'graphql-scalars'
import { exprEmail, generateId, generateToken, getUserId, hashPassword, hashPin, validatePassword } from "../../utils";
import { ISysAcceso } from "../../interfaces";
// import { generateToken, hashPassword } from "../utils";

const tipeDefs = `#graphql

    extend type Query {
        getAllAcceso: [sys_acceso!]!
        getOneAcceso(acc_id: Int): sys_acceso
    }

    extend type Mutation {
        signUp(data: SignUpInput!): AuthPayload!
        signUpOAuth(data: SignUpOAuthInput!): sys_acceso!
        login(data: LoginInput!): AuthPayload!
        updateAcceso(acc_id: Int!, data: UpdateAccesoInput!): sys_acceso!
        updatePinAcceso(acc_id: Int!, acc_pin: String!): sys_acceso!
        validaCorreo(correo: String!): validaPayload!
        validaTokenEmail(id: Int!, token: String!): validaTokenEmailResp!
        changePassword(acc_id: Int!, password: String!): sys_acceso!
    }

    type sys_acceso {
        acc_id: Int!
        acc_persona: Int
        acc_email: String
        acc_celular: String
        acc_nombre: String!
        acc_fech_acceso: DateTime
        acc_create: DateTime
        acc_update: DateTime
        acc_st: Int
        acc_firma: Int
        acc_pin: String
        control: [sys_control!]!
        persona: persona
    }

    input SignUpInput {
        acc_persona: Int!
        acc_email: String
        acc_celular: String
        acc_nombre: String!
        acc_password: String!
        acc_token: String
    }

    input SignUpOAuthInput {
        acc_email: String!
        acc_nombre: String!
    }

    input LoginInput {
        usuario: String!
        acc_password: String!
    }

    input UpdateAccesoInput {
        acc_persona: Int
        acc_email: String
        acc_celular: String
        acc_nombre: String
        acc_password: String
    }

    type AuthPayload {
        token: String!
        user: sys_acceso!
    }

    type validaPayload {
        estado: Boolean!
        acc_id: Int
        acc_nombre: String
        token: String
    }

    type validaTokenEmailResp {
        estado: Boolean!
        acc_id: Int
    }

    scalar DateTime
`

const resolvers = {
    DateTime: DateTimeResolver,
    Query: {
        getAllAcceso: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_acceso.findMany()
        },
        getOneAcceso: async (_parent: any, _args: { acc_id: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_acceso.findUnique({
                where: {
                    acc_id: _args.acc_id
                }
            })
        }
    },
    Mutation: {
        validaCorreo: async (_parent: any, _args: { correo: string }, context: Context) => {
            exprEmail(_args.correo);
            const user = await context.prisma.sys_acceso.findMany({
                where: {
                    acc_email: _args.correo
                }
            })
            if (user.length > 0) {
                const genID = generateId()
                await context.prisma.sys_acceso.update({
                    where: {
                        acc_id: user[0].acc_id
                    },
                    data: {
                        acc_token: genID
                    }
                })
                return {
                    estado: true,
                    acc_id: user[0].acc_id,
                    acc_nombre: user[0].acc_nombre,
                    token: genID
                }
            }
            throw new Error("El correo no existe")
        },
        validaTokenEmail: async (_parent: any, _args: { id: number, token: string }, context: Context) => {
            const user = await context.prisma.sys_acceso.findMany({
                where: {
                    acc_id: _args.id,
                    acc_token: _args.token
                }
            })
            if (user.length > 0) {
                return {
                    estado: true,
                    acc_id: user[0].acc_id
                }
            }
            return {
                estado: false,
                acc_id: 0
            }
        },
        changePassword: async (_parent: any, _args: { acc_id: number, password: string }, context: Context) => {
            const password = await hashPassword(_args.password)
            const user = await context.prisma.sys_acceso.update({
                where: {
                    acc_id: _args.acc_id
                },
                data: {
                    acc_password: password,
                    acc_token: null
                }
            })
            return user
        },
        signUp: async (_parent: any, _args: { data: { acc_persona: number, acc_email: string, acc_celular: string, acc_nombre: string, acc_password: string } }, context: Context) => {
            exprEmail(_args.data.acc_email);
            const verificarEmail = await context.prisma.sys_acceso.findMany({
                where: {
                    acc_email: _args.data.acc_email
                }
            })
            if (verificarEmail) throw new Error('El email ya existe')

            const verificarCelular = await context.prisma.sys_acceso.findUnique({
                where: { acc_celular: _args.data.acc_celular }
            })
            if (verificarCelular) throw new Error('El celular ya existe')

            const password = await hashPassword(_args.data.acc_password)
            const user = await context.prisma.sys_acceso.create({
                data: {
                    acc_persona: _args.data.acc_persona,
                    acc_email: _args.data.acc_email,
                    acc_celular: _args.data.acc_celular,
                    acc_nombre: _args.data.acc_nombre,
                    acc_password: password,
                    acc_create: new Date()
                }
            })

            return {
                token: generateToken(user.acc_id),
                user,
            }
        },
        signUpOAuth: async (_parent: any, _args: { data: { acc_email: string, acc_nombre: string } }, context: Context) => {
            const { acc_email, acc_nombre } = _args.data
            // exprEmail(acc_email);
            // if (acc_email) {
            //     const verificaCorreo = await context.prisma.persona.findMany({
            //         where: { per_correo: acc_email }
            //     })
            //     if (verificaCorreo.length > 0) throw new Error('El correo ya existe')
            //     const verificaCorreoSysAcceso = await context.prisma.sys_acceso.findMany({
            //         where: { acc_email: acc_email }
            //     })
            //     if (verificaCorreoSysAcceso.length > 0) throw new Error('El correo ya existe')
            // }
            const password = await hashPassword('@123@456')



            const verificaCorreoSysAcceso = await context.prisma.sys_acceso.findMany({
                where: { acc_email: acc_email }
            })
            console.log(verificaCorreoSysAcceso)
            if (verificaCorreoSysAcceso.length > 0) throw new Error('El correo ya existe')
            console.log(acc_email, acc_nombre, "procesando registro")

            return await context.prisma.sys_acceso.create({
                data: {
                    acc_email: acc_email,
                    acc_nombre: acc_nombre,
                    acc_password: password,
                    acc_create: new Date(),
                    sys_control: {
                        create: {
                            cont_perfil: 2,
                            cont_sucursal: 1,
                        }
                    }
                },

            })
        },
        login: async (_parent: any, _args: { data: { usuario: string, acc_password: string } }, context: Context) => {
            console.log(_args.data.usuario, "procesando login")
            const accesoEmail = await context.prisma.sys_acceso.findMany({
                where: {
                    acc_email: _args.data.usuario
                }
            })
            if (accesoEmail.length === 0) {
                const accesoCelular = await context.prisma.sys_acceso.findUnique({
                    where: { acc_celular: _args.data.usuario }
                })
                if (!accesoCelular) {
                    throw new Error('Usuario no existe')
                }
                const valid = await validatePassword(_args.data.acc_password, accesoCelular.acc_password)
                if (!valid) {
                    throw new Error('Contraseña incorrecta')
                }
                const ID: any = accesoCelular.acc_id
                return {
                    token: generateToken(ID),
                    user: accesoCelular,
                }
            }
            const valid = await validatePassword(_args.data.acc_password, accesoEmail[0].acc_password)
            if (!valid) {
                throw new Error('Contraseña incorrecta')
            }
            const ID: any = accesoEmail[0].acc_id
            return {
                token: generateToken(ID),
                user: accesoEmail[0],
            }
        },
        updateAcceso: async (_parent: any, _args: { acc_id: number, data: { acc_persona: number, acc_email: string, acc_celular: string, acc_nombre: string, acc_password: string } }, context: Context) => {
            const userId = getUserId(context)

            const user = await context.prisma.sys_acceso.findUnique({
                where: { acc_id: _args.acc_id }
            })

            if (!user) throw new Error('No existe el usuario')

            exprEmail(_args.data.acc_email);
            const verificarEmail = await context.prisma.sys_acceso.findMany({
                where: {
                    acc_email: _args.data.acc_email
                }
            })
            if (verificarEmail) throw new Error('El email ya existe')

            const verificarCelular = await context.prisma.sys_acceso.findUnique({
                where: { acc_celular: _args.data.acc_celular }
            })
            if (verificarCelular) throw new Error('El celular ya existe')

            if (_args.data.acc_password) {
                _args.data.acc_password = await hashPassword(_args.data.acc_password)
            }
            const editUser = await context.prisma.sys_acceso.update({
                where: {
                    acc_id: _args.acc_id
                },
                data: {
                    acc_persona: _args.data.acc_persona,
                    acc_email: _args.data.acc_email,
                    acc_celular: _args.data.acc_celular,
                    acc_nombre: _args.data.acc_nombre,
                    acc_password: _args.data.acc_password,
                    acc_update: new Date()
                }
            })
            return editUser
        },
        updatePinAcceso: async (_parent: any, _args: { acc_id: number, acc_pin: string }, context: Context) => {
            const userId = getUserId(context)

            const user = await context.prisma.sys_acceso.findUnique({
                where: { acc_id: _args.acc_id }
            })

            if (!user) throw new Error('No existe el usuario')

            if (_args.acc_pin.length !== 4) throw new Error('El PIN debe comprender de 4 caracteres')

            const pin = await hashPin(_args.acc_pin)

            console.log(pin)

            const editUser = await context.prisma.sys_acceso.update({
                where: {
                    acc_id: _args.acc_id
                },
                data: {
                    acc_pin: pin,
                    acc_update: new Date()
                }
            })
            return editUser
        },
    },
    sys_acceso: {
        control: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_acceso.findUnique({
                where: { acc_id: _parent.acc_id }
            }).sys_control()
        },
        persona: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_acceso.findUnique({
                where: {
                    acc_id: _parent.acc_id
                }
            }).persona()
        }
    }
}


export { tipeDefs as sysAccesoTipeDef, resolvers as sysAccesoResolv }