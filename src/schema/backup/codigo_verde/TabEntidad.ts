
import { context, Context } from '../../context';
import { getUserId, newIdEmpresa } from "../../utils";
import { DateTimeResolver } from 'graphql-scalars';
import { argsToArgsConfig } from "graphql/type/definition";
import { Prisma } from "@prisma/client";

const tipeDefs = `#graphql

    extend type Query {
        getAllTabEntidad(skip:Int, take:Int, where: TabEntidadWhereInput, byUser: Boolean): [TabEntidad!]!
        findEntidadByNomComDirec(nomComer: String,direccion: String): [TabEntidad!]!
        getOneTabEntidad(IdEmpresa: String): TabEntidad
    }

    extend type Mutation {
        createTabEntidad(data:TabEntidadInput): TabEntidad
        updateTabEntidad(IdEmpresa: String!, data:TabEntidadInput): TabEntidad
    }

    type TabEntidad {
        IdEmpresa: String!
        RazonSocial: String
        NomComer: String
        Direccion: String
        Email: String
        Ruc: String
        Telef: String
        id_tipo_entidad: Int
        CodigoMapa: String
        Ubicacion: String
        id_zona: Int
        Activo: Boolean
        usuario_acceso_create: Int
        usuario_acceso_update: Int
        latitud: Float
        longitud: Float
        tipoEntidad: TabTipoEntidad
        zona: TabZona
        detalleEntidad: [detalle_entidad!]!
        solicitudAtencion: [solicitud_atencion!]!
        visitaVentas: [visita_ventas!]!
        
    }

    input TabEntidadInput {
        RazonSocial: String,
        NomComer: String,
        Direccion: String,
        Email: String,
        Ruc: String,
        Telef: String,
        id_tipo_entidad: Int,
        CodigoMapa: String,
        Ubicacion: String,
        id_zona: Int,
        Activo: Boolean,
        latitud: Float,
        longitud: Float
    }

    input TabEntidadWhereInput {
        IdEmpresa: StringNullableFilter
        NomComer: StringNullableFilter
        Direccion: StringNullableFilter
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
`

interface dataEntidad {
    RazonSocial: string,
    NomComer: string,
    Direccion: string,
    Email: string,
    Ruc: string,
    Telef: string,
    id_tipo_entidad: number,
    CodigoMapa: string,
    Ubicacion: string,
    id_zona: number,
    Activo: boolean
    latitud: number,
    longitud: number
}

const resolvers = {
    DateTime: DateTimeResolver,
    Query: {
        getAllTabEntidad: async (_parent: any, _args: { skip?: number, take?: number, where: Prisma.TabEntidadWhereInput, byUser:boolean }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabEntidad.findMany({
                skip: 0,
                take: 50,
                where: {
                    AND: [
                        _args.where,
                        {
                            usuario_acceso_create: _args.byUser === true ? userId : undefined
                        },
                        { Activo: true }
                    ]
                }
            })
        },
        getOneTabEntidad: async (_parent: any, _args: { IdEmpresa: string }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabEntidad.findUnique({
                where: {
                    IdEmpresa: _args.IdEmpresa,
                }
            })
        },
        findEntidadByNomComDirec: async (_parent: any, _args: { nomComer: string, direccion: string }, context: Context) => {
            // const userId = getUserId(context)
            return await context.prisma.tabEntidad.findMany({
                where: {
                    Activo: true,
                    OR: [
                        {
                            NomComer: {
                                contains: _args.nomComer
                            }
                        },
                        {
                            Direccion: {
                                contains: _args.direccion
                            }
                        }
                    ]
                }
            })
        }
    },
    Mutation: {
        createTabEntidad: async (_parent: any, args: { data: dataEntidad }, context: Context) => {
            const userId = getUserId(context)
            const ultimo_objeto: any = await context.prisma.$queryRaw`select max(IdEmpresa) as maximo from TabEntidad`;

            if(args.data.NomComer) {
                const existe = await context.prisma.tabEntidad.findFirst({
                    where: {
                        AND: [
                            { NomComer: args.data.NomComer },
                            { id_tipo_entidad: args.data.id_tipo_entidad }
                        ]
                    }
                })
                if(existe) {
                    throw new Error("Ya existe una entidad con el mismo tipo y nombre comercial")
                }
            }
//             usuario_acceso_create Int?
//   usuario_acceso_update Int?
            
            return await context.prisma.tabEntidad.create({
                data: {
                    IdEmpresa: newIdEmpresa(ultimo_objeto),
                    RazonSocial: args.data.RazonSocial,
                    NomComer: args.data.NomComer,
                    Direccion: args.data.Direccion,
                    Email: args.data.Email,
                    Ruc: args.data.Ruc,
                    Telef: args.data.Telef,
                    id_tipo_entidad: args.data.id_tipo_entidad,
                    CodigoMapa: args.data.CodigoMapa,
                    Ubicacion: args.data.Ubicacion,
                    id_zona: args.data.id_zona,
                    usuario_acceso_create: userId,
                }
            })
        },
        updateTabEntidad: async (_parent: any, args: { IdEmpresa: string, data: dataEntidad }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabEntidad.update({
                where: {
                    IdEmpresa: args.IdEmpresa
                },
                data: {
                    RazonSocial: args.data.RazonSocial,
                    NomComer: args.data.NomComer,
                    Direccion: args.data.Direccion,
                    Email: args.data.Email,
                    Ruc: args.data.Ruc,
                    Telef: args.data.Telef,
                    id_tipo_entidad: args.data.id_tipo_entidad,
                    CodigoMapa: args.data.CodigoMapa,
                    Ubicacion: args.data.Ubicacion,
                    id_zona: args.data.id_zona,
                    usuario_acceso_update: userId,
                }
            })
        }
    },
    TabEntidad: {
        detalleEntidad: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.tabEntidad.findUnique({
                where: {
                    IdEmpresa: _parent.IdEmpresa
                }
            }).detalle_entidad()
        },
        solicitudAtencion: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.tabEntidad.findUnique({
                where: {
                    IdEmpresa: _parent.IdEmpresa
                }
            }).solicitud_atencion()
        },
        zona: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.tabEntidad.findUnique({
                where: {
                    IdEmpresa: _parent.IdEmpresa
                }
            }).TabZona()
        },
        tipoEntidad: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.tabEntidad.findUnique({
                where: {
                    IdEmpresa: _parent.IdEmpresa
                }
            }).TabTipoEntidad()
        },
        visitaVentas: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.tabEntidad.findUnique({
                where: {
                    IdEmpresa: _parent.IdEmpresa
                }
            }).visita_ventas()
        }
    }
}


export { tipeDefs as tabEntidadTipeDef, resolvers as tabEntidadResolv }