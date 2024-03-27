
import { context, Context } from '../../context';
import { FormatDateTimeSQLServer, getUserId, newIdLlamada } from "../../utils";
import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from 'graphql-scalars';
import { Prisma } from "@prisma/client";
import moment from "moment-timezone";

const tipeDefs = `#graphql

    extend type Query {
        getAllSolicitudAtencion(skip:Int, take:Int, where: SolicitudAtencionWhereInput): [solicitud_atencion!]!
        getAllToDaySolicitudAtencion: [solicitud_atencion!]!
        getOneSolicitudAtencion(IdSolicitud: Int): solicitud_atencion
    }

    extend type Mutation {
        createSolicitudAtencion(data:SolicitudAtencionInput): solicitud_atencion
        updateSolicitudAtencion(IdSolicitud: Int!, data:SolicitudAtencionInput): solicitud_atencion
        anularSolicitudAtencion(IdSolicitud: Int!, MotivoAnulacion: String): solicitud_atencion
    }

    type solicitud_atencion {
        IdSolicitud: Int!
        IdLlamada: String
        fecha: DateTime
        Empresa: String
        Paciente: String
        Detalle: String
        IdEmpresa: String
        Contacto: String
        IdContacto: Int
        IdEstado: Int
        IdTipoSolicitud: Int
        FecReg: DateTime
        FecModi: DateTime
        MotivoAnulacion: String
        IdUsuarioModi: Int
        IdSucursal: Int
        Direccion: String
        Ubicacion: String
        TelefContacto: String
        Servicio: String
        MedicoTratante: String
        Seguro: String
        Activo: Boolean
        Hora: String
        IdCanal: Int
        LugarAtencion: String
        IdMedico: Int
        IdModulo: Int
        Diferenciado: Boolean
        id_usuario_reg: Int
        usuario_acceso_create: Int
        usuario_acceso_update: Int
        latitud: Float
        longitud: Float
        num_caso: String
        cita: Boolean
        canal: TabCanal
        tipoSolicitud: TabTipoSolicitud
        entidad: TabEntidad
        contacto: contacto
        estado: TabEstado
        sucursal: TabSucursal
    }

    input SolicitudAtencionInput {
        fecha: DateTime
        Empresa: String
        Paciente: String
        Detalle: String
        IdEmpresa: String
        Contacto: String
        IdContacto: Int
        IdEstado: Int
        IdTipoSolicitud: Int
        FecReg: String
        FecModi: DateTime
        MotivoAnulacion: String
        IdUsuarioModi: Int
        IdSucursal: Int
        Direccion: String
        Ubicacion: String
        TelefContacto: String
        Servicio: String
        MedicoTratante: String
        Seguro: String
        Activo: Boolean
        Hora: String
        latitud: Float
        longitud: Float
        num_caso: String
        cita: Boolean
        IdCanal: Int
        LugarAtencion: String
        IdMedico: Int
        IdModulo: Int
        Diferenciado: Boolean
        id_usuario_reg: Int
        usuario_acceso_create: Int
        usuario_acceso_update: Int
    }

    input SolicitudAtencionWhereInput {
        IdSolicitud: IntNullableFilter
        IdCanal: IntNullableFilter
        Paciente: StringNullableFilter
        Detalle: StringNullableFilter
        Empresa: StringNullableFilter
        Contacto: StringNullableFilter
        usuario_acceso_create: IntNullableFilter
    }

    input IntNullableFilter {
        equals: Int
        in: [Int]
        notIn: [Int]
        lt: Int
        lte: Int
        gt: Int
        gte: Int
        not: [Int]
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
    scalar Date
`

interface dataSolicitudAtencion {
    fecha: Date,                        //DateTime
    Empresa: string,
    Paciente: string,
    Detalle: string,
    IdEmpresa: string,
    Contacto: string,
    IdContacto: number,
    IdEstado: number,
    IdTipoSolicitud: number,
    FecReg: string,                       //DateTime
    FecModi: Date,                      //DateTime
    MotivoAnulacion: string,
    IdUsuarioModi: number,
    IdSucursal: number,
    Direccion: string,
    Ubicacion: string,
    TelefContacto: string,
    Servicio: string,
    MedicoTratante: string,
    Seguro: string,
    Activo: boolean,
    Hora: string,
    latitud: number,
    longitud: number,
    num_caso: string,
    cita: boolean,
    IdCanal: number,
    LugarAtencion: string,
    IdMedico: number,
    IdModulo: number,
    Diferenciado: boolean,
    id_usuario_reg: number,
    usuario_acceso_create: number,
    usuario_acceso_update: number,
}
const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,

    Query: {
        getAllSolicitudAtencion: async (_parent: any, _args: { skip?: number, take?: number, where: Prisma.solicitud_atencionWhereInput }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.solicitud_atencion.findMany({
                skip: _args.skip,
                take: _args.take,
                where: _args.where,
            })
        },

        getAllToDaySolicitudAtencion: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            console.log("userId", userId)
            return await context.prisma.$queryRaw`SELECT * FROM solicitud_atencion WHERE Activo = 1 AND usuario_acceso_create=${userId} AND FecReg>=convert(date,GETDATE()) and IdCanal=9
            order by hora desc`
        },

        getOneSolicitudAtencion: async (_parent: any, _args: { IdSolicitud: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.solicitud_atencion.findUnique({
                where: {
                    IdSolicitud: _args.IdSolicitud
                }
            })
        }
    },
    Mutation: {
        createSolicitudAtencion: async (_parent: any, args: { data: dataSolicitudAtencion, contac_usuario_reg: number }, context: Context) => {
            const userId = getUserId(context)
            const ultimo_objeto: any = await context.prisma.$queryRaw`select max(IdLlamada) as maximo from solicitud_atencion`;
            const now = moment();
            process.env.TZ = 'America/Lima';
            console.log(args.data)
            return await context.prisma.solicitud_atencion.create({
                data: {
                    IdLlamada: newIdLlamada(ultimo_objeto),
                    fecha: FormatDateTimeSQLServer(now.format()),
                    // fecha: args.data.FecReg,
                    Empresa: args.data.Empresa,
                    Paciente: args.data.Paciente,
                    Detalle: args.data.Detalle,
                    IdEmpresa: args.data.IdEmpresa,
                    Contacto: args.data.Contacto,
                    IdContacto: args.data.IdContacto,
                    IdEstado: args.data.IdEstado,
                    IdTipoSolicitud: args.data.IdTipoSolicitud,
                    // FecReg: FormatDateTimeSQLServer(new Date()),
                    // FecReg: args.data.FecReg ? FormatDateTimeSQLServer(new Date(args.data.FecReg)) : null,
                    FecReg: args.data.FecReg ? FormatDateTimeSQLServer(new Date(args.data.FecReg)) : FormatDateTimeSQLServer(now.format()),
                    // FecModi: FormatDateTimeSQLServer(new Date()),
                    MotivoAnulacion: args.data.MotivoAnulacion,
                    IdUsuarioModi: args.data.IdUsuarioModi,
                    IdSucursal: args.data.IdSucursal,
                    Direccion: args.data.Direccion,
                    Ubicacion: args.data.Ubicacion,
                    TelefContacto: args.data.TelefContacto,
                    Servicio: args.data.Servicio,
                    MedicoTratante: args.data.MedicoTratante,
                    Seguro: args.data.Seguro,
                    Activo: true,
                    Hora: new Date(args.data.FecReg).getHours().toString().padStart(2, '0') + ":" + new Date(args.data.FecReg).getMinutes().toString().padStart(2, '0'),
                    IdCanal: 9,
                    LugarAtencion: args.data.LugarAtencion,
                    IdMedico: args.data.IdMedico,
                    IdModulo: args.data.IdModulo,
                    Diferenciado: args.data.Diferenciado,
                    id_usuario_reg: null,
                    usuario_acceso_create: args.data.usuario_acceso_create,
                    latitud: args.data.latitud,
                    longitud: args.data.longitud,
                    num_caso: args.data.num_caso,
                    cita: args.data.cita,
                }
            })
        },
        updateSolicitudAtencion: async (_parent: any, args: { IdSolicitud: number, data: dataSolicitudAtencion, contac_usuario_update: number }, context: Context) => {
            const userId = getUserId(context)
            const now = moment();
            const validaEstado: any = await context.prisma.solicitud_atencion.findUnique({
                where: {
                    IdSolicitud: args.IdSolicitud
                }
            })
            if (validaEstado.IdEstado === 1) {
                return await context.prisma.solicitud_atencion.update({
                    where: {
                        IdSolicitud: args.IdSolicitud,
                    },
                    data: {
                        // fecha: Date(),
                        Empresa: args.data.Empresa,
                        Paciente: args.data.Paciente,
                        Detalle: args.data.Detalle,
                        IdEmpresa: args.data.IdEmpresa,
                        Contacto: args.data.Contacto,
                        IdContacto: args.data.IdContacto,
                        IdEstado: args.data.IdEstado,
                        IdTipoSolicitud: args.data.IdTipoSolicitud,
                        FecReg: args.data.FecReg ? FormatDateTimeSQLServer(new Date(args.data.FecReg)) : FormatDateTimeSQLServer(now.format()),
                        FecModi: FormatDateTimeSQLServer(now.format()),
                        MotivoAnulacion: args.data.MotivoAnulacion,
                        IdUsuarioModi: args.data.IdUsuarioModi,
                        IdSucursal: args.data.IdSucursal,
                        Direccion: args.data.Direccion,
                        Ubicacion: args.data.Ubicacion,
                        TelefContacto: args.data.TelefContacto,
                        Servicio: args.data.Servicio,
                        MedicoTratante: args.data.MedicoTratante,
                        Seguro: args.data.Seguro,
                        Activo: args.data.Activo,
                        Hora: new Date(args.data.FecReg).getHours().toString().padStart(2, '0') + ":" + new Date(args.data.FecReg).getMinutes().toString().padStart(2, '0'),
                        IdCanal: args.data.IdCanal,
                        LugarAtencion: args.data.LugarAtencion,
                        IdMedico: args.data.IdMedico,
                        IdModulo: args.data.IdModulo,
                        Diferenciado: args.data.Diferenciado,
                        id_usuario_reg: args.data.id_usuario_reg,
                        usuario_acceso_create: args.data.usuario_acceso_create,
                        usuario_acceso_update: args.data.usuario_acceso_update,
                        latitud: args.data.latitud,
                        longitud: args.data.longitud,
                        num_caso: args.data.num_caso,
                        cita: args.data.cita,
                    }
                })
            } else {
                return new Error("No se puede modificar una solicitud atendida");
            }


        },
        anularSolicitudAtencion: async (_parent: any, args: { IdSolicitud: number, MotivoAnulacion: string, IdUsuarioModi: number }, context: Context) => {
            const userId = getUserId(context)

            const validaEstado: any = await context.prisma.solicitud_atencion.findUnique({
                where: {
                    IdSolicitud: args.IdSolicitud
                }
            })

            //anulado
            if (validaEstado.IdEstado === 3) return new Error("No se puede anular una solicitud anulada");

            if (validaEstado.IdEstado === 1) { //pendiente
                return await context.prisma.solicitud_atencion.update({
                    where: {
                        IdSolicitud: args.IdSolicitud,
                    },
                    data: {
                        IdEstado: 3,
                        MotivoAnulacion: args.MotivoAnulacion,
                        IdUsuarioModi: userId
                    }
                })
            } else {
                return new Error("No se puede anular una solicitud atendida");
            }

        }
    },
    solicitud_atencion: {
        canal: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.solicitud_atencion.findUnique({
                where: {
                    IdSolicitud: _parent.IdSolicitud
                }
            }).TabCanal()
        },
        tipoSolicitud: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.solicitud_atencion.findUnique({
                where: {
                    IdSolicitud: _parent.IdSolicitud
                }
            }).TabTipoSolicitud()
        },
        contacto: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.solicitud_atencion.findUnique({
                where: {
                    IdSolicitud: _parent.IdSolicitud
                }
            }).contacto()
        },
        estado: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.solicitud_atencion.findUnique({
                where: {
                    IdSolicitud: _parent.IdSolicitud
                }
            }).TabEstado()
        },
        sucursal: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.solicitud_atencion.findUnique({
                where: {
                    IdSolicitud: _parent.IdSolicitud
                }
            }).TabSucursal()
        },
        entidad: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.solicitud_atencion.findUnique({
                where: {
                    IdSolicitud: _parent.IdSolicitud
                }
            }).TabEntidad()
        }
    }
}


export { tipeDefs as solicitudAtencionTipeDef, resolvers as solicitudAtencionResolv }