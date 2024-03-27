import { context, Context } from '../../context';
import { FormatDateTimeSQLServer, getUserId } from "../../utils";
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from "graphql-scalars";

const tipeDefs = `#graphql

    extend type Query {
        getAllAtencion: [atencion!]!
        getOneAtencion(id_atencion: Int!): atencion
        getAllAtencionAuxiliar(id_empresa: Int,  input: String): [atencion!]!
        getFindSucursalForAtencion(id_atencion: Int, origen: String): respSucursal
        getAtencionesAuxiliares(id_empresa: Int!, input: String): [atencion!]!
    }

    extend type Mutation {
        createAtencion(data:Input_atencion): atencion
        createAtencionPersona(data:Input_PersonaAtencion): returnDataAtencion
        updateAtencion(id_atencion: Int!, data:Input_atencion): atencion
    }

    type respSucursal {
        id_empresa: Int
        TabSucursal: [TabSucursal]
    }

    type atencion {
        id_atencion: Int!
        id_empresa: Int!
        id_paciente: Int
        id_tipo_paciente: Int!
        id_tipo_atencion: Int!
        id_tipo_origen: Int
        id_categoria_pago: Int
        id_contratante: Int
        id_beneficio: Int
        id_medico: Int
        c_historia_orden: String
        f_activo: Boolean
        d_fecha_ingreso: DateTime
        d_fecha_alta: DateTime
        id_parentesco: Int
        t_nombre_titular: String
        c_numero_poliza: String
        c_placa_vehiculo: String
        c_certificado: String
        f_soat: Int
        f_denuncia: Int
        f_carta_garantia: Int
        t_resp_1_nombre: String
        t_resp_1_trabajo: String
        t_resp_1_cargo: String
        t_resp_1_fono1: String
        t_resp_1_fono2: String
        t_resp_2_nombre: String
        t_resp_2_trabajo: String
        t_resp_2_cargo: String
        t_resp_2_fono1: String
        t_resp_2_fono2: String
        f_alta: Int
        id_tipo_egreso: Int
        id_proveedor: Int
        id_proveedor_contacto: Int
        d_proveedor_fecha: DateTime
        t_proveedor_comentario: String
        t_numero_caso: String
        id_hotel_entidad: Int
        c_hotel_telefono_1: String
        c_hotel_telefono_2: String
        t_hotel_email: String
        d_hotel_llegada: DateTime
        d_hotel_salida: DateTime
        id_hotel_agencia: Int
        t_hotel_contacto: String
        c_hotel_agencia_fono1: String
        c_hotel_agencia_fono2: String
        f_transferencia: Int
        IdUsuario: Int
        Acceso: Boolean
        UsuReg: String
        IdLlamada: String
        Hora: String
        IdSolicitud: Int
        f_estado_ref: Int
        id_atencion_ref: Int
        id_persona: Int
        d_fecha_registro: DateTime
        d_fecha_modifica: DateTime
        usuario_acceso_create: Int
        usuario_acceso_update: Int
        id_plan_seguro_r7: Int
        id_categoria_pago_r7: Int
        persona: persona
        empresa: empresa
        tipo_paciente: tipo_paciente
        tipo_atencion: tipo_atencion
        paciente: PACIENTE
    }

    type returnDataAtencion {
        atencion: atencion
        persona: persona
    }

    input Input_PersonaAtencion {
        id_persona: String
        per_tipo_doc: String!,
        per_nro_doc: String,
        per_appat: String!,
        per_apmat: String,
        per_nombres: String!,
        per_cel: String!,
        per_direccion: String,
        per_correo: String,
        per_sexo: String,
        per_esta_civil: String,
        per_fecha_nac: Date,
        dataAtencion: Input_atencion
    }

    input Input_atencion {
        id_atencion: String
        id_empresa: Int
        id_paciente: Int
        id_tipo_paciente: Int
        id_tipo_atencion: Int
        id_tipo_origen: Int
        id_categoria_pago: Int
        id_contratante: Int
        id_beneficio: Int
        id_medico: Int
        c_historia_orden: String
        f_activo: Boolean
        d_fecha_ingreso: DateTime
        d_fecha_alta: DateTime
        id_parentesco: Int
        t_nombre_titular: String
        c_numero_poliza: String
        c_placa_vehiculo: String
        c_certificado: String
        f_soat: Int
        f_denuncia: Int
        f_carta_garantia: Int
        t_resp_1_nombre: String
        t_resp_1_trabajo: String
        t_resp_1_cargo: String
        t_resp_1_fono1: String
        t_resp_1_fono2: String
        t_resp_2_nombre: String
        t_resp_2_trabajo: String
        t_resp_2_cargo: String
        t_resp_2_fono1: String
        t_resp_2_fono2: String
        f_alta: Int
        id_tipo_egreso: Int
        id_proveedor: Int
        id_proveedor_contacto: Int
        d_proveedor_fecha: DateTime
        t_proveedor_comentario: String
        t_numero_caso: String
        id_hotel_entidad: Int
        c_hotel_telefono_1: String
        c_hotel_telefono_2: String
        t_hotel_email: String
        d_hotel_llegada: DateTime
        d_hotel_salida: DateTime
        id_hotel_agencia: Int
        t_hotel_contacto: String
        c_hotel_agencia_fono1: String
        c_hotel_agencia_fono2: String
        f_transferencia: Int
        IdUsuario: Int
        Acceso: Boolean
        UsuReg: String
        IdLlamada: String
        Hora: String
        IdSolicitud: Int
        f_estado_ref: Int
        id_atencion_ref: Int
        id_persona: Int
        d_fecha_registro: DateTime
        d_fecha_modifica: DateTime
        usuario_acceso_create: Int
        usuario_acceso_update: Int
        id_plan_seguro_r7: Int
        id_categoria_pago_r7: Int
    }

    ${DateTimeTypeDefinition}
    ${DateTypeDefinition}

`

interface I_PersonaAtencion {
    id_persona: string,
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
    dataAtencion: I_atencion,
}

interface I_atencion {
    id_atencion: string,
    id_empresa: number,
    id_paciente: number,
    id_tipo_paciente: number,
    id_tipo_atencion: number,
    id_tipo_origen: number,
    id_categoria_pago: number,
    id_contratante: number,
    id_beneficio: number,
    id_medico: number,
    c_historia_orden: string,
    f_activo: boolean,
    d_fecha_ingreso: Date,
    d_fecha_alta: Date,
    id_parentesco: number,
    t_nombre_titular: string,
    c_numero_poliza: string,
    c_placa_vehiculo: string,
    c_certificado: string,
    f_soat: number,
    f_denuncia: number,
    f_carta_garantia: number,
    t_resp_1_nombre: string,
    t_resp_1_trabajo: string,
    t_resp_1_cargo: string,
    t_resp_1_fono1: string,
    t_resp_1_fono2: string,
    t_resp_2_nombre: string,
    t_resp_2_trabajo: string,
    t_resp_2_cargo: string,
    t_resp_2_fono1: string,
    t_resp_2_fono2: string,
    f_alta: number,
    id_tipo_egreso: number,
    id_proveedor: number,
    id_proveedor_contacto: number,
    d_proveedor_fecha: Date,
    t_proveedor_comentario: string,
    t_numero_caso: string,
    id_hotel_entidad: number,
    c_hotel_telefono_1: string,
    c_hotel_telefono_2: string,
    t_hotel_email: string,
    d_hotel_llegada: Date,
    d_hotel_salida: Date,
    id_hotel_agencia: number,
    t_hotel_contacto: string,
    c_hotel_agencia_fono1: string,
    c_hotel_agencia_fono2: string,
    f_transferencia: number,
    IdUsuario: number,
    Acceso: boolean,
    UsuReg: string,
    IdLlamada: string,
    Hora: string,
    IdSolicitud: number,
    f_estado_ref: number,
    id_atencion_ref: number,
    id_persona: number,
    d_fecha_registro: Date,
    d_fecha_modifica: Date,
    usuario_acceso_create: number,
    usuario_acceso_update: number,
    id_plan_seguro_r7: number,
    id_categoria_pago_r7: number,
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getOneAtencion: async (_parent: any, _args: { id_atencion: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.aTENCION.findUnique({
                where: {
                    id_atencion: _args.id_atencion
                }
            })
        },
        getAllAtencion: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.aTENCION.findMany()
        },
        getAllAtencionAuxiliar: async (_parent: any, _args: { id_empresa: number, input: string }, context: Context) => {
            const userId = getUserId(context)
            if (_args.id_empresa === 1) {
                return await context.prisma.aTENCION.findMany({
                    where: {
                        AND: [
                            {
                                id_empresa: _args.id_empresa
                            },
                            {
                                id_paciente: null
                            }
                        ],
                        OR: [
                            {
                                persona: {
                                    per_nombre_completo: {
                                        contains: _args.input
                                    }
                                }
                            },
                            {
                                persona: {
                                    per_nro_doc: {
                                        contains: _args.input
                                    }
                                }
                            }
                        ]
                    },
                    skip: 0,
                    take: 50,
                    orderBy: {
                        id_atencion: 'desc'
                    }
                })
            } else {
                return await context.prisma.aTENCION.findMany({
                    where: {
                        id_empresa: _args.id_empresa,
                        OR: [
                            {
                                PACIENTE: {
                                    c_numero_historia: {
                                        in: _args.input
                                    }
                                }
                            },
                            {
                                PACIENTE: {
                                    t_nombre_paciente: {
                                        contains: _args.input
                                    }
                                }
                            },
                            {
                                PACIENTE: {
                                    c_numero_documento: {
                                        contains: _args.input
                                    }
                                }
                            },
                            {
                                persona: {
                                    per_nombre_completo: {
                                        contains: _args.input
                                    }
                                }
                            },
                            {
                                persona: {
                                    per_nro_doc: {
                                        contains: _args.input
                                    }
                                }
                            }
                        ]
                    },
                    skip: 0,
                    take: 50,
                    orderBy: {
                        id_atencion: 'desc'
                    }
                })
            }

        },
        getFindSucursalForAtencion: async (_parent: any, _args: { id_atencion: number, origen: string }, context: Context) => {
            // const { origen }: any = _args
            const userId = getUserId(context)
            if (_args.origen === "R") {
                const sucursal = await context.prisma.tabSucursal.findMany({
                    where: {
                        IdEmpresa: 1
                    }
                })
                return {
                    id_empresa: 1,
                    TabSucursal: sucursal
                }
            }
            const atencion = await context.prisma.aTENCION.findUnique({
                where: {
                    id_atencion: _args.id_atencion
                }
            })
            if (atencion) {
                const { id_empresa } = atencion
                const sucursal = await context.prisma.tabSucursal.findMany({
                    where: {
                        IdEmpresa: id_empresa
                    }
                })

                return {
                    id_empresa,
                    TabSucursal: sucursal
                }
            }
            return null
        },
        getAtencionesAuxiliares: async (_parent: any, _args: { id_empresa: number, input: string }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.aTENCION.findMany({
                where: {
                    AND: [
                        {
                            NOT: {
                                id_persona: null
                            }
                        },
                        { id_empresa: _args.id_empresa }
                    ],
                    OR: [
                        {
                            persona: {
                                per_nombre_completo: {
                                    contains: _args.input
                                }
                            }
                        },
                        {
                            persona: {
                                per_nro_doc: {
                                    contains: _args.input
                                }
                            }
                        },
                        // {
                        //     id_atencion: {
                        //         in: Number(_args.input)
                        //     }
                        // }
                    ]
                },
                skip: 0,
                take: 50,
                orderBy: {
                    id_atencion: 'desc'
                }
            })
        }
    },
    Mutation: {
        createAtencionPersona: async (_parent: any, _args: { data: I_PersonaAtencion }, context: Context) => {
            const userId = getUserId(context)

            const { data } = _args

            const { id_persona, per_tipo_doc, per_nro_doc, per_appat, per_apmat, per_nombres, per_cel, per_direccion, per_correo, per_sexo, per_esta_civil, per_fecha_nac, dataAtencion } = data

            const { id_empresa, id_atencion,  id_plan_seguro_r7, id_categoria_pago_r7 } = dataAtencion

            const verificaPersona = await context.prisma.persona.findFirst({
                where: {
                    AND: [
                        { per_tipo_doc: per_tipo_doc },
                        { per_nro_doc: per_nro_doc }
                    ]
                }
            })

            if (id_persona === "nuevo" && !verificaPersona && id_atencion === "new") {
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
                const dataPersona = await context.prisma.persona.create({
                    data: {
                        per_tipo_doc,
                        per_nro_doc: per_nro_doc ?? null,
                        per_appat,
                        per_apmat,
                        per_nombres,
                        per_nombre_completo: `${per_nombres} ${per_appat} ${per_apmat}`,
                        per_cel,
                        per_direccion,
                        per_correo,
                        per_sexo,
                        per_esta_civil,
                        per_fecha_nac: per_fecha_nac ? FormatDateTimeSQLServer(new Date(per_fecha_nac)) : null,
                        per_fech_reg: FormatDateTimeSQLServer(new Date()),
                        ATENCION: {
                            create: {
                                id_empresa,
                                id_paciente: null,
                                id_tipo_paciente: 2,
                                id_tipo_atencion: 11,
                                id_tipo_origen: 10,
                                id_categoria_pago: 2031,
                                id_contratante: 2,
                                id_beneficio: 1, //1 -> no especifica      4 -> consulta ambulatoria
                                id_medico: null,
                                c_historia_orden: null,
                                f_activo: true,
                                d_fecha_ingreso: FormatDateTimeSQLServer(new Date()),
                                d_fecha_alta: null,
                                id_parentesco: null,
                                t_nombre_titular: null,
                                c_numero_poliza: null,
                                c_placa_vehiculo: null,
                                c_certificado: null,
                                f_soat: null,
                                f_denuncia: null,
                                f_carta_garantia: null,
                                t_resp_1_nombre: null,
                                t_resp_1_trabajo: null,
                                t_resp_1_cargo: null,
                                t_resp_1_fono1: null,
                                t_resp_1_fono2: null,
                                t_resp_2_nombre: null,
                                t_resp_2_trabajo: null,
                                t_resp_2_cargo: null,
                                t_resp_2_fono1: null,
                                t_resp_2_fono2: null,
                                f_alta: null,
                                id_tipo_egreso: 1,
                                id_proveedor: 1,
                                id_proveedor_contacto: 1,
                                d_proveedor_fecha: null,
                                t_proveedor_comentario: null,
                                t_numero_caso: null,
                                id_hotel_entidad: 1,
                                c_hotel_telefono_1: null,
                                c_hotel_telefono_2: null,
                                t_hotel_email: null,
                                d_hotel_llegada: null,
                                d_hotel_salida: null,
                                id_hotel_agencia: 1,
                                t_hotel_contacto: null,
                                c_hotel_agencia_fono1: null,
                                c_hotel_agencia_fono2: null,
                                f_transferencia: null,
                                IdUsuario: null,
                                Acceso: null,
                                UsuReg: null,
                                IdLlamada: null,
                                Hora: null,
                                IdSolicitud: null,
                                f_estado_ref: null,
                                id_atencion_ref: null,
                                d_fecha_registro: FormatDateTimeSQLServer(new Date()),
                                usuario_acceso_create: userId,
                                id_plan_seguro_r7,
                                id_categoria_pago_r7,
                            }
                        }
                    }
                })
                return {
                    atencion: undefined,
                    persona: dataPersona
                }
            }

            if (id_persona !== "nuevo" && verificaPersona && id_atencion === "new") {
                await context.prisma.persona.update({
                    where: { per_id: Number(id_persona) },
                    data: {
                        per_tipo_doc,
                        per_nro_doc: per_nro_doc ?? null,
                        per_appat,
                        per_apmat,
                        per_nombres,
                        per_nombre_completo: `${per_nombres} ${per_appat} ${per_apmat}`,
                        per_cel,
                        per_direccion,
                        per_correo,
                        per_sexo,
                        per_esta_civil,
                        per_fecha_nac: per_fecha_nac ? FormatDateTimeSQLServer(new Date(per_fecha_nac)) : null,
                        per_fech_reg: FormatDateTimeSQLServer(new Date()),
                    }
                })
                const dataAtencion = await context.prisma.aTENCION.create({
                    data: {
                        id_empresa,
                        id_paciente: null,
                        id_tipo_paciente: 2,
                        id_tipo_atencion: 11,
                        id_tipo_origen: 10,
                        id_categoria_pago: 2031,
                        id_contratante: 2,
                        id_beneficio: 1, //1 -> no especifica      4 -> consulta ambulatoria
                        id_medico: null,
                        c_historia_orden: null,
                        f_activo: true,
                        d_fecha_ingreso: FormatDateTimeSQLServer(new Date()),
                        d_fecha_alta: null,
                        id_parentesco: null,
                        t_nombre_titular: null,
                        c_numero_poliza: null,
                        c_placa_vehiculo: null,
                        c_certificado: null,
                        f_soat: null,
                        f_denuncia: null,
                        f_carta_garantia: null,
                        t_resp_1_nombre: null,
                        t_resp_1_trabajo: null,
                        t_resp_1_cargo: null,
                        t_resp_1_fono1: null,
                        t_resp_1_fono2: null,
                        t_resp_2_nombre: null,
                        t_resp_2_trabajo: null,
                        t_resp_2_cargo: null,
                        t_resp_2_fono1: null,
                        t_resp_2_fono2: null,
                        f_alta: null,
                        id_tipo_egreso: 1,
                        id_proveedor: 1,
                        id_proveedor_contacto: 1,
                        d_proveedor_fecha: null,
                        t_proveedor_comentario: null,
                        t_numero_caso: null,
                        id_hotel_entidad: 1,
                        c_hotel_telefono_1: null,
                        c_hotel_telefono_2: null,
                        t_hotel_email: null,
                        d_hotel_llegada: null,
                        d_hotel_salida: null,
                        id_hotel_agencia: 1,
                        t_hotel_contacto: null,
                        c_hotel_agencia_fono1: null,
                        c_hotel_agencia_fono2: null,
                        f_transferencia: null,
                        IdUsuario: null,
                        Acceso: null,
                        UsuReg: null,
                        IdLlamada: null,
                        Hora: null,
                        IdSolicitud: null,
                        f_estado_ref: null,
                        id_atencion_ref: null,
                        d_fecha_registro: FormatDateTimeSQLServer(new Date()),
                        usuario_acceso_create: userId,
                        id_persona: Number(id_persona),
                        id_plan_seguro_r7,
                        id_categoria_pago_r7,
                    }
                })

                return {
                    atencion: dataAtencion,
                    persona: undefined,
                }
            }
            if (id_persona !== "nuevo" && verificaPersona && id_atencion !== "new") {
                await context.prisma.persona.update({
                    where: { per_id: Number(id_persona) },
                    data: {
                        per_tipo_doc,
                        per_nro_doc: per_nro_doc ?? null,
                        per_appat,
                        per_apmat,
                        per_nombres,
                        per_nombre_completo: `${per_nombres} ${per_appat} ${per_apmat}`,
                        per_cel,
                        per_direccion,
                        per_correo,
                        per_sexo,
                        per_esta_civil,
                        per_fecha_nac: per_fecha_nac ? FormatDateTimeSQLServer(new Date(per_fecha_nac)) : null,
                        per_fech_reg: FormatDateTimeSQLServer(new Date()),
                    }
                })
                const dataAtencion = await context.prisma.aTENCION.update({
                    where: { id_atencion: Number(id_atencion) },
                    data: {
                        id_empresa,
                        id_paciente: null,
                        id_tipo_paciente: 2,
                        id_tipo_atencion: 11,
                        id_tipo_origen: 10,
                        id_categoria_pago: 2031,
                        id_contratante: 2,
                        id_beneficio: 1, //1 -> no especifica      4 -> consulta ambulatoria
                        id_medico: null,
                        c_historia_orden: null,
                        f_activo: true,
                        d_fecha_alta: null,
                        id_parentesco: null,
                        t_nombre_titular: null,
                        c_numero_poliza: null,
                        c_placa_vehiculo: null,
                        c_certificado: null,
                        f_soat: null,
                        f_denuncia: null,
                        f_carta_garantia: null,
                        t_resp_1_nombre: null,
                        t_resp_1_trabajo: null,
                        t_resp_1_cargo: null,
                        t_resp_1_fono1: null,
                        t_resp_1_fono2: null,
                        t_resp_2_nombre: null,
                        t_resp_2_trabajo: null,
                        t_resp_2_cargo: null,
                        t_resp_2_fono1: null,
                        t_resp_2_fono2: null,
                        f_alta: null,
                        id_tipo_egreso: 1,
                        id_proveedor: 1,
                        id_proveedor_contacto: 1,
                        d_proveedor_fecha: null,
                        t_proveedor_comentario: null,
                        t_numero_caso: null,
                        id_hotel_entidad: 1,
                        c_hotel_telefono_1: null,
                        c_hotel_telefono_2: null,
                        t_hotel_email: null,
                        d_hotel_llegada: null,
                        d_hotel_salida: null,
                        id_hotel_agencia: 1,
                        t_hotel_contacto: null,
                        c_hotel_agencia_fono1: null,
                        c_hotel_agencia_fono2: null,
                        f_transferencia: null,
                        IdUsuario: null,
                        Acceso: null,
                        UsuReg: null,
                        IdLlamada: null,
                        Hora: null,
                        IdSolicitud: null,
                        f_estado_ref: null,
                        id_atencion_ref: null,
                        d_fecha_modifica: FormatDateTimeSQLServer(new Date()),
                        usuario_acceso_update: userId,
                        id_plan_seguro_r7,
                        id_categoria_pago_r7,
                    }
                })

                return {
                    atencion: dataAtencion,
                    persona: undefined,
                }
            }
        },
        createAtencion: async (_parent: any, _args: { data: I_atencion }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.aTENCION.create({
                data: {
                    id_empresa: _args.data.id_empresa,
                    id_paciente: _args.data.id_paciente,
                    id_tipo_paciente: _args.data.id_tipo_paciente,
                    id_tipo_atencion: _args.data.id_tipo_atencion,
                    id_tipo_origen: _args.data.id_tipo_origen,
                    id_categoria_pago: _args.data.id_categoria_pago,
                    id_contratante: _args.data.id_contratante,
                    id_beneficio: _args.data.id_beneficio,
                    id_medico: _args.data.id_medico,
                    c_historia_orden: _args.data.c_historia_orden,
                    f_activo: _args.data.f_activo,
                    d_fecha_ingreso: _args.data.d_fecha_ingreso,
                    d_fecha_alta: _args.data.d_fecha_alta,
                    id_parentesco: _args.data.id_parentesco,
                    t_nombre_titular: _args.data.t_nombre_titular,
                    c_numero_poliza: _args.data.c_numero_poliza,
                    c_placa_vehiculo: _args.data.c_placa_vehiculo,
                    c_certificado: _args.data.c_certificado,
                    f_soat: _args.data.f_soat,
                    f_denuncia: _args.data.f_denuncia,
                    f_carta_garantia: _args.data.f_carta_garantia,
                    t_resp_1_nombre: _args.data.t_resp_1_nombre,
                    t_resp_1_trabajo: _args.data.t_resp_1_trabajo,
                    t_resp_1_cargo: _args.data.t_resp_1_cargo,
                    t_resp_1_fono1: _args.data.t_resp_1_fono1,
                    t_resp_1_fono2: _args.data.t_resp_1_fono2,
                    t_resp_2_nombre: _args.data.t_resp_2_nombre,
                    t_resp_2_trabajo: _args.data.t_resp_2_trabajo,
                    t_resp_2_cargo: _args.data.t_resp_2_cargo,
                    t_resp_2_fono1: _args.data.t_resp_2_fono1,
                    t_resp_2_fono2: _args.data.t_resp_2_fono2,
                    f_alta: _args.data.f_alta,
                    id_tipo_egreso: _args.data.id_tipo_egreso,
                    id_proveedor: _args.data.id_proveedor,
                    id_proveedor_contacto: _args.data.id_proveedor_contacto,
                    d_proveedor_fecha: _args.data.d_proveedor_fecha,
                    t_proveedor_comentario: _args.data.t_proveedor_comentario,
                    t_numero_caso: _args.data.t_numero_caso,
                    id_hotel_entidad: _args.data.id_hotel_entidad,
                    c_hotel_telefono_1: _args.data.c_hotel_telefono_1,
                    c_hotel_telefono_2: _args.data.c_hotel_telefono_2,
                    t_hotel_email: _args.data.t_hotel_email,
                    d_hotel_llegada: _args.data.d_hotel_llegada,
                    d_hotel_salida: _args.data.d_hotel_salida,
                    id_hotel_agencia: _args.data.id_hotel_agencia,
                    t_hotel_contacto: _args.data.t_hotel_contacto,
                    c_hotel_agencia_fono1: _args.data.c_hotel_agencia_fono1,
                    c_hotel_agencia_fono2: _args.data.c_hotel_agencia_fono2,
                    f_transferencia: _args.data.f_transferencia,
                    IdUsuario: _args.data.IdUsuario,
                    Acceso: _args.data.Acceso,
                    UsuReg: _args.data.UsuReg,
                    IdLlamada: _args.data.IdLlamada,
                    Hora: _args.data.Hora,
                    IdSolicitud: _args.data.IdSolicitud,
                    f_estado_ref: _args.data.f_estado_ref,
                    id_atencion_ref: _args.data.id_atencion_ref,
                    id_persona: _args.data.id_persona,
                    id_plan_seguro_r7: _args.data.id_plan_seguro_r7,
                    id_categoria_pago_r7: _args.data.id_categoria_pago_r7,
                }
            })
        },
        updateAtencion: async (_parent: any, _args: { id_atencion: number, data: I_atencion }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.aTENCION.update({
                where: {
                    id_atencion: _args.id_atencion
                },
                data: {
                    id_empresa: _args.data.id_empresa,
                    id_paciente: _args.data.id_paciente,
                    id_tipo_paciente: _args.data.id_tipo_paciente,
                    id_tipo_atencion: _args.data.id_tipo_atencion,
                    id_tipo_origen: _args.data.id_tipo_origen,
                    id_categoria_pago: _args.data.id_categoria_pago,
                    id_contratante: _args.data.id_contratante,
                    id_beneficio: _args.data.id_beneficio,
                    id_medico: _args.data.id_medico,
                    c_historia_orden: _args.data.c_historia_orden,
                    f_activo: _args.data.f_activo,
                    d_fecha_ingreso: _args.data.d_fecha_ingreso,
                    d_fecha_alta: _args.data.d_fecha_alta,
                    id_parentesco: _args.data.id_parentesco,
                    t_nombre_titular: _args.data.t_nombre_titular,
                    c_numero_poliza: _args.data.c_numero_poliza,
                    c_placa_vehiculo: _args.data.c_placa_vehiculo,
                    c_certificado: _args.data.c_certificado,
                    f_soat: _args.data.f_soat,
                    f_denuncia: _args.data.f_denuncia,
                    f_carta_garantia: _args.data.f_carta_garantia,
                    t_resp_1_nombre: _args.data.t_resp_1_nombre,
                    t_resp_1_trabajo: _args.data.t_resp_1_trabajo,
                    t_resp_1_cargo: _args.data.t_resp_1_cargo,
                    t_resp_1_fono1: _args.data.t_resp_1_fono1,
                    t_resp_1_fono2: _args.data.t_resp_1_fono2,
                    t_resp_2_nombre: _args.data.t_resp_2_nombre,
                    t_resp_2_trabajo: _args.data.t_resp_2_trabajo,
                    t_resp_2_cargo: _args.data.t_resp_2_cargo,
                    t_resp_2_fono1: _args.data.t_resp_2_fono1,
                    t_resp_2_fono2: _args.data.t_resp_2_fono2,
                    f_alta: _args.data.f_alta,
                    id_tipo_egreso: _args.data.id_tipo_egreso,
                    id_proveedor: _args.data.id_proveedor,
                    id_proveedor_contacto: _args.data.id_proveedor_contacto,
                    d_proveedor_fecha: _args.data.d_proveedor_fecha,
                    t_proveedor_comentario: _args.data.t_proveedor_comentario,
                    t_numero_caso: _args.data.t_numero_caso,
                    id_hotel_entidad: _args.data.id_hotel_entidad,
                    c_hotel_telefono_1: _args.data.c_hotel_telefono_1,
                    c_hotel_telefono_2: _args.data.c_hotel_telefono_2,
                    t_hotel_email: _args.data.t_hotel_email,
                    d_hotel_llegada: _args.data.d_hotel_llegada,
                    d_hotel_salida: _args.data.d_hotel_salida,
                    id_hotel_agencia: _args.data.id_hotel_agencia,
                    t_hotel_contacto: _args.data.t_hotel_contacto,
                    c_hotel_agencia_fono1: _args.data.c_hotel_agencia_fono1,
                    c_hotel_agencia_fono2: _args.data.c_hotel_agencia_fono2,
                    f_transferencia: _args.data.f_transferencia,
                    IdUsuario: _args.data.IdUsuario,
                    Acceso: _args.data.Acceso,
                    UsuReg: _args.data.UsuReg,
                    IdLlamada: _args.data.IdLlamada,
                    Hora: _args.data.Hora,
                    IdSolicitud: _args.data.IdSolicitud,
                    f_estado_ref: _args.data.f_estado_ref,
                    id_atencion_ref: _args.data.id_atencion_ref,
                    id_persona: _args.data.id_persona,
                    id_plan_seguro_r7: _args.data.id_plan_seguro_r7,
                    id_categoria_pago_r7: _args.data.id_categoria_pago_r7,
                }
            })
        }
    },
    atencion: {
        persona: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.aTENCION.findUnique({
                where: {
                    id_atencion: _parent.id_atencion
                }
            }).persona()
        },
        empresa: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.aTENCION.findUnique({
                where: {
                    id_atencion: _parent.id_atencion
                }
            }).empresa()
        },
        tipo_paciente: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.aTENCION.findUnique({
                where: {
                    id_atencion: _parent.id_atencion
                }
            }).tipo_paciente()
        },
        tipo_atencion: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.aTENCION.findUnique({
                where: {
                    id_atencion: _parent.id_atencion
                }
            }).tipo_atencion()
        },
        paciente: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.aTENCION.findUnique({
                where: {
                    id_atencion: _parent.id_atencion
                }
            }).PACIENTE()
        }
    },
}

export { tipeDefs as atencionTipeDef, resolvers as atencionResolv }