
import { context, Context } from '../../context';
import { FormatDateTimeSQLServer, getUserId, hashPassword } from "../../utils";
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from 'graphql-scalars';

const tipeDefs = `#graphql

    extend type Query {
        getAllPersona: [persona!]!
        findOneDocumentPersona(per_tipo_doc:String, per_nro_doc: String): persona
        getOnePersona(per_id: Int): persona
    }

    extend type Mutation {
        createPersona(data:PersonaInput): persona
        createPersona2(data:PersonaInput): persona
        createPersonaLink(data:PersonaInput,per_id:Int!,empresa_id:String!): persona        
        createProfileLink(data:PersonaInput,acc_password: String): persona
        updateContactoPersona(contac_id: Int!, data:PersonaInput): persona
        addPersonaEntidad(per_id: Int!, empresa_id: String!): persona
        addFirmaPersona(per_id: Int, per_firma_src: String): persona
    }

    type persona {
        per_id: Int!
        per_tipo_doc: String!
        per_nro_doc: String
        per_appat: String!
        per_apmat: String
        per_nombres: String!
        per_cel: String!
        per_direccion: String
        per_correo: String
        per_sexo: String
        per_esta_civil: String
        per_fecha_nac: Date
        per_fech_reg: DateTime
        per_fech_update: DateTime
        per_nombre_completo: String
        per_firma_src: String
        contacto: [contacto!]!
        sys_acceso: [sys_acceso!]!
        atencion: [atencion!]!
    }

    input PersonaInput {
        per_id: Int
        per_tipo_doc: String!,
        per_nro_doc: String!,
        per_appat: String!,
        per_apmat: String,
        per_nombres: String!,
        per_cel: String!,
        per_direccion: String,
        per_correo: String!,
        per_sexo: String,
        per_esta_civil: String,
        per_fecha_nac: Date,
        per_nombre_completo: String
        acc_pin: String
        dataEntidad: [dataEntidadInput]
    }

    input dataEntidadInput {
        det_cp_entidad: String
    }

    scalar DateTime
    scalar Date
`

interface dataPersona {
    per_tipo_doc: string,
    per_nro_doc: string,
    per_appat: string,
    per_apmat: string,
    per_nombres: string,
    per_cel: string,
    per_direccion: string,
    per_correo: string,
    per_sexo: string,
    per_esta_civil: string,
    per_fecha_nac: Date,
    per_nombre_completo: string,
    acc_pin: string,
    dataEntidad: { det_cp_entidad: string }[]
}
const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,

    Query: {
        getAllPersona: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.persona.findMany()
        },

        findOneDocumentPersona: async (_parent: any, _args: { per_tipo_doc: string, per_nro_doc: string }, context: Context) => {
            return await context.prisma.persona.findFirst({
                where: {
                    AND: [
                        { per_tipo_doc: _args.per_tipo_doc },
                        { per_nro_doc: _args.per_nro_doc }
                    ]
                }
            })
        },

        getOnePersona: async (_parent: any, _args: { per_id: number }, context: Context) => {
            // const userId = getUserId(context)
            return await context.prisma.persona.findUnique({
                where: {
                    per_id: _args.per_id
                }
            })
        }
    },
    Mutation: {
        createProfileLink: async (_parent: any, args: { data: dataPersona, acc_password: string }, context: Context) => {
            const { data, acc_password } = args

            const { per_tipo_doc, per_nro_doc, per_appat, per_apmat, per_nombres, per_cel, per_direccion, per_correo, per_sexo, per_esta_civil, per_fecha_nac } = data

            const verificaPersona = await context.prisma.persona.findFirst({
                where: {
                    AND: [
                        { per_tipo_doc: per_tipo_doc },
                        { per_nro_doc: per_nro_doc }
                    ]
                }
            })
            if (verificaPersona) throw new Error('El documento ya existe')

            if (per_correo) {
                const verificaCorreo = await context.prisma.persona.findMany({
                    where: { per_correo: data?.per_correo }
                })
                if (verificaCorreo.length > 0) throw new Error('El correo ya existe')
                const verificaCorreoSysAcceso = await context.prisma.sys_acceso.findMany({
                    where: { acc_email: data?.per_correo }
                })
                if (verificaCorreoSysAcceso.length > 0) throw new Error('El correo ya existe')
            }
            if (per_cel) {
                const verificaCel = await context.prisma.persona.findUnique({
                    where: { per_cel: data?.per_cel }
                })
                if (verificaCel) throw new Error('El celular ya existe')
                const verificaCelular = await context.prisma.sys_acceso.findUnique({
                    where: { acc_celular: data?.per_cel }
                })
                if (verificaCelular) throw new Error('El celular ya existe')
            }
            const acc_nombre = (per_nombres + ', ' + per_appat + ' ' + per_apmat).toUpperCase()
            const password = await hashPassword(acc_password)

            return await context.prisma.persona.create({
                data: {
                    per_tipo_doc,
                    per_nro_doc: per_nro_doc ?? null,
                    per_appat,
                    per_apmat,
                    per_nombres,
                    per_cel,
                    per_direccion,
                    per_correo,
                    per_sexo,
                    per_esta_civil,
                    per_fech_reg: FormatDateTimeSQLServer(new Date()),
                    per_fecha_nac: per_fecha_nac ? FormatDateTimeSQLServer(new Date(per_fecha_nac)) : null,
                    per_nombre_completo: per_nombres + ', ' + per_appat + ' ' + per_apmat,
                    sys_acceso: {
                        create: {
                            acc_email: per_correo ?? null,
                            acc_celular: per_cel,
                            acc_nombre: acc_nombre,
                            acc_password: password,
                            acc_st: 1,
                            sys_control: {
                                create: {
                                    cont_perfil: 2,
                                    cont_sucursal: 1,
                                }
                            }
                        }
                    },
                    contacto: {
                        create: {
                            contac_usuario_reg: 1,
                            contac_tipo: 3,
                            detalle_entidad: {
                                create: {
                                    det_cp_entidad: "E02418"
                                }
                            }
                        }
                    },
                }
            })
        },
        createPersonaLink: async (_parent: any, args: { data: dataPersona, per_id: number, empresa_id: string }, context: Context) => {

            const { data, per_id, empresa_id } = args
            console.log(data)
            const verificaPersona = await context.prisma.persona.findUnique({
                where: { per_id: per_id }
            })
            if (!verificaPersona) throw new Error(`No existe persona con el id ${per_id}`)
            const verificaEmpresa = await context.prisma.tabEntidad.findUnique({
                where: { IdEmpresa: empresa_id }
            })
            if (!verificaEmpresa) throw new Error(`No existe empresa con el id ${empresa_id}`)

            // if (data.per_correo.length > 0) {
            //     const verificaCorreo = await context.prisma.persona.findMany({
            //         where: { per_correo: data.per_correo }
            //     })
            //     if (verificaCorreo) throw new Error('El correo ya existe')
            //     const verificaCorreoSysAcceso = await context.prisma.sys_acceso.findMany({
            //         where: { acc_email: data.per_correo }
            //     })
            //     if (verificaCorreoSysAcceso.length > 0) throw new Error('El correo ya existe')
            // }
            if (data.per_correo) {
                const verificaCorreo = await context.prisma.persona.findMany({
                    where: { per_correo: data?.per_correo }
                })
                if (verificaCorreo.length > 0) throw new Error('El correo ya existe')
                const verificaCorreoSysAcceso = await context.prisma.sys_acceso.findMany({
                    where: { acc_email: data?.per_correo }
                })
                if (verificaCorreoSysAcceso.length > 0) throw new Error('El correo ya existe')
            }
            if (data.per_cel) {
                const verificaCel = await context.prisma.persona.findUnique({
                    where: { per_cel: data?.per_cel }
                })
                if (verificaCel) throw new Error('El celular ya existe')
                const verificaCelular = await context.prisma.sys_acceso.findUnique({
                    where: { acc_celular: data?.per_cel }
                })
                if (verificaCelular) throw new Error('El celular ya existe')
            }

            const { per_tipo_doc, per_nro_doc, per_appat, per_apmat, per_nombres, per_cel, per_direccion, per_correo, per_sexo, per_esta_civil, per_fecha_nac } = data

            if (data.per_nro_doc) {
                const verificaNDoc = await context.prisma.persona.findMany({
                    where: { per_nro_doc: data.per_nro_doc }
                })
                if (verificaNDoc.length > 0) throw new Error('El numero de documento ya existe')
            }



            const acc_nombre = (per_nombres + ', ' + per_appat + ' ' + per_apmat).toUpperCase()

            const password = await hashPassword(per_nro_doc)

            return await context.prisma.persona.create({
                data: {
                    per_tipo_doc,
                    per_nro_doc,
                    per_appat,
                    per_apmat,
                    per_nombres,
                    per_cel,
                    per_direccion,
                    per_correo: per_correo ?? null,
                    per_sexo,
                    per_esta_civil,
                    per_fech_reg: FormatDateTimeSQLServer(new Date()),
                    per_fecha_nac: per_fecha_nac ? FormatDateTimeSQLServer(new Date(per_fecha_nac)) : null,
                    per_nombre_completo: per_nombres + ', ' + per_appat + ' ' + per_apmat,
                    contacto: {
                        create: {
                            contac_usuario_reg: per_id,
                            contac_tipo: 4,
                            detalle_entidad: {
                                create: {
                                    det_cp_entidad: empresa_id
                                }
                            }
                        }
                    },
                    sys_acceso: {
                        create: {
                            acc_email: per_correo ?? null,
                            acc_celular: per_cel,
                            acc_nombre: acc_nombre,
                            acc_password: password,
                            acc_st: 1,
                            sys_control: {
                                create: {
                                    cont_perfil: 3,
                                    cont_sucursal: 1,
                                }
                            }
                        }
                    }
                }

            })
        },
        createPersona2: async (_parent: any, args: { data: dataPersona }, context: Context) => {
            const { data } = args
            const { per_tipo_doc, per_nro_doc, per_appat, per_apmat, per_nombres, per_cel, per_direccion, per_correo, per_sexo, per_esta_civil, per_fecha_nac } = data

            if (data.per_correo) {
                const verificaCorreo = await context.prisma.persona.findMany({
                    where: { per_correo: data?.per_correo }
                })
                if (verificaCorreo.length > 0) throw new Error('El correo ya existe')
                const verificaCorreoSysAcceso = await context.prisma.sys_acceso.findMany({
                    where: { acc_email: data?.per_correo }
                })
                if (verificaCorreoSysAcceso.length > 0) throw new Error('El correo ya existe')
            }

            if (data.per_cel) {
                const verificaCel = await context.prisma.persona.findUnique({
                    where: { per_cel: data?.per_cel }
                })
                if (verificaCel) throw new Error('El celular ya existe')
                const verificaCelular = await context.prisma.sys_acceso.findUnique({
                    where: { acc_celular: data?.per_cel }
                })
                if (verificaCelular) throw new Error('El celular ya existe')
                if (data.per_cel.length > 9 && data.per_cel.length < 15) throw new Error('Celular debe tener 9 digitos y menos de 15')
            }
            if (data.per_nro_doc) {
                const verificaNDoc = await context.prisma.persona.findMany({
                    where: { per_nro_doc: data.per_nro_doc }
                })
                if (verificaNDoc.length > 0) throw new Error('El numero de documento ya existe')
            }


            console.log(per_correo)
            return await context.prisma.persona.create({
                // data: {
                //     per_tipo_doc,
                //     per_nro_doc: per_nro_doc ?? null,
                //     per_appat,
                //     per_apmat,
                //     per_nombres,
                //     per_cel,
                //     per_direccion,
                //     per_correo: per_correo ?? null,
                //     per_sexo,
                //     per_esta_civil,
                //     per_fech_update: new Date(),
                //     per_fecha_nac: per_fecha_nac ? new Date(per_fecha_nac) : null,
                // }
                data: {
                    per_tipo_doc,
                    per_nro_doc: per_nro_doc ?? null,
                    per_appat,
                    per_apmat: null,
                    per_nombres,
                    per_cel,
                    per_direccion: null,
                    per_correo: per_correo ?? null,
                    per_sexo: null,
                    per_esta_civil: null,
                    per_fech_reg: FormatDateTimeSQLServer(new Date()),
                    per_fecha_nac: per_fecha_nac ? FormatDateTimeSQLServer(new Date(per_fecha_nac)) : null,
                    per_nombre_completo: per_nombres + ', ' + per_appat + ' ' + per_apmat,
                    contacto: {
                        create: {
                            contac_usuario_reg: 1,
                            contac_tipo: 4,
                            detalle_entidad: {
                                create: {
                                    det_cp_entidad: "E00001"
                                }
                            }
                        }
                    },

                }
            })
        },
        createPersona: async (_parent: any, args: { data: dataPersona }, context: Context) => {
            const userId = getUserId(context)
            const { data } = args
            if (data.per_correo) {
                const verificaCorreo = await context.prisma.persona.findMany({
                    where: { per_correo: data?.per_correo }
                })
                if (verificaCorreo.length > 0) throw new Error('El correo ya existe')
                const verificaCorreoSysAcceso = await context.prisma.sys_acceso.findMany({
                    where: { acc_email: data?.per_correo }
                })
                if (verificaCorreoSysAcceso.length > 0) throw new Error('El correo ya existe')
            }
            if (data.per_cel) {
                const verificaCel = await context.prisma.persona.findUnique({
                    where: { per_cel: data?.per_cel }
                })
                if (verificaCel) throw new Error('El celular ya existe')
                const verificaCelular = await context.prisma.sys_acceso.findUnique({
                    where: { acc_celular: data?.per_cel }
                })
                if (verificaCelular) throw new Error('El celular ya existe')
                if (data.per_cel.length > 9 && data.per_cel.length < 15) throw new Error('Celular debe tener 9 digitos y menos de 15')
            }

            const { per_tipo_doc, per_nro_doc, per_appat, per_apmat, per_nombres, per_cel, per_direccion, per_correo, per_sexo, per_esta_civil, per_fecha_nac } = data

            if (data.per_nro_doc) {
                const verificaNDoc = await context.prisma.persona.findMany({
                    where: {
                        per_nro_doc: data?.per_nro_doc
                    }
                })
                if (verificaNDoc.length > 0) throw new Error('El numero de documento ya existe')
            }

            const acc_nombre = (per_nombres + ', ' + per_appat + ' ' + per_apmat).toUpperCase()
            const password = await hashPassword(per_nro_doc)

            return await context.prisma.persona.create({
                data: {
                    per_tipo_doc,
                    per_nro_doc,
                    per_appat,
                    per_apmat,
                    per_nombres,
                    per_cel,
                    per_direccion,
                    per_correo: per_correo ?? null,
                    per_sexo,
                    per_esta_civil,
                    per_fech_reg: FormatDateTimeSQLServer(new Date()),
                    per_fecha_nac: per_fecha_nac ? FormatDateTimeSQLServer(new Date(per_fecha_nac)) : null,
                    per_nombre_completo: per_nombres + ', ' + per_appat + ' ' + per_apmat,
                    contacto: {
                        create: {
                            contac_usuario_reg: userId,
                            contac_tipo: 4,
                            detalle_entidad: {
                                createMany: {
                                    data: data?.dataEntidad
                                }
                            }
                        }
                    },
                    sys_acceso: {
                        create: {
                            acc_email: per_correo ?? null,
                            acc_celular: per_cel,
                            acc_nombre: acc_nombre,
                            acc_password: password,
                            acc_st: 1,
                            sys_control: {
                                create: {
                                    cont_perfil: 3,
                                    cont_sucursal: 1,
                                }
                            }
                        }
                    }
                }
            })
        },
        updateContactoPersona: async (_parent: any, args: { contac_id: number, data: dataPersona }, context: Context) => {
            const userId = getUserId(context)
            const { contac_id, data } = args
            const { per_tipo_doc, per_nro_doc, per_appat, per_apmat, per_nombres, per_cel, per_direccion, per_correo, per_sexo, per_esta_civil, per_fecha_nac } = data

            const validaContacto = await context.prisma.contacto.findUnique({
                where: {
                    contac_id: contac_id
                }
            })

            if (!validaContacto) throw new Error('No existe el contacto')

            const validaPersona = await context.prisma.persona.findUnique({
                where: {
                    per_id: validaContacto.contac_persona
                }
            })

            if (!validaPersona) throw new Error('No existe la persona')

            // if (data.per_correo) {
            //     const verificaCorreo = await context.prisma.persona.findMany({
            //         where: {
            //             AND: {
            //                 NOT: {
            //                     per_id: validaPersona.per_id
            //                 },
            //                 per_correo: data?.per_correo
            //             }
            //         }
            //     })

                // if (verificaCorreo.length > 0) throw new Error('El correo ya existe')
                // const verificaCorreoForSysAcceso = await context.prisma.sys_acceso.findMany({
                //     where: {
                //         AND: [
                //             { acc_persona: validaPersona.per_id },
                //             { acc_email: data?.per_correo },
                //         ]
                //     }
                // })

                // if (verificaCorreoForSysAcceso.length > 0) {
                //     await context.prisma.sys_acceso.update({
                //         where: {
                //             acc_id: verificaCorreoForSysAcceso[0].acc_id
                //         },
                //         data: {
                //             acc_email: data?.per_correo
                //         }
                //     })
                // }
            // }

            // if (data.per_cel) {
            //     const verificaCel = await context.prisma.persona.findMany({
            //         where: {
            //             AND: [
            //                 { per_cel: data?.per_cel },
            //                 { per_id: { not: validaPersona.per_id } }
            //             ]
            //         }
            //     })
            //     if (verificaCel.length > 0) throw new Error('El celular ya existe')
            // }

            if (data.per_nro_doc) {
                const verificaNDoc = await context.prisma.persona.findMany({
                    where: {
                        AND: [
                            { per_nro_doc: data?.per_nro_doc },
                            { per_id: { not: validaPersona.per_id } }
                        ]
                    }
                })
                if (verificaNDoc.length > 0) throw new Error('El numero de documento ya existe')
            }

            // const acc_nombre = (per_nombres + ', ' + per_appat + ' ' + per_apmat).toUpperCase()

            await context.prisma.sys_acceso.update({
                where: {
                    acc_id: userId
                },
                data: {
                    acc_nombre: per_nombres + ', ' + per_appat + ' ' + per_apmat,
                    // acc_celular: per_cel,
                    acc_email: per_correo ?? null,
                }
            })

            return await context.prisma.persona.update({
                where: {
                    per_id: validaPersona.per_id
                },
                data: {
                    per_tipo_doc,
                    per_nro_doc,
                    per_appat,
                    per_apmat,
                    per_nombres,
                    per_cel,
                    per_direccion,
                    per_correo: per_correo ?? null,
                    per_sexo,
                    per_esta_civil,
                    per_fecha_nac: per_fecha_nac ? FormatDateTimeSQLServer(new Date(per_fecha_nac)) : null,
                    per_nombre_completo: per_nombres + ', ' + per_appat + ' ' + per_apmat,
                }
            })

        },
        addFirmaPersona: async (_parent: any, args: { per_id: number, per_firma_src: string }, context: Context) => {
            const verificaPersona = await context.prisma.persona.findUnique({
                where: { per_id: args?.per_id }
            })
            if (!verificaPersona) throw new Error(`No existe persona con el id ${args?.per_id}`)

            return await context.prisma.persona.update({
                where: {
                    per_id: args.per_id
                },
                data: {
                    per_firma_src: args?.per_firma_src
                }
            })
        }

    },
    persona: {
        contacto: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.persona.findUnique({
                where: {
                    per_id: _parent.per_id
                }
            }).contacto()
        },
        sys_acceso: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.persona.findUnique({
                where: {
                    per_id: _parent.per_id
                }
            }).sys_acceso()
        },
        atencion: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.persona.findUnique({
                where: {
                    per_id: _parent.per_id
                }
            }).ATENCION()
        }
    }
}
export { tipeDefs as personaTipeDef, resolvers as personaResolv }