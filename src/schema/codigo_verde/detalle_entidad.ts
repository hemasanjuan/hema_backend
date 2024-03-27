
import { context, Context } from '../../context';
import { getUserId } from "../../utils";

const tipeDefs = `#graphql

    extend type Query {
        getAllDetalleEmpresa: [detalle_entidad!]!
        getOneDetalleEmpresa(det_cp_id: Int): detalle_entidad
        getFindDetEntidad(idContact: String): [detalle_entidad!]!
    }

    extend type Mutation {
        createDetalleEmpresa(data:DetalleEmpresaInput): detalle_entidad
        updateDetalleEmpresa(det_cp_id: Int!, data:DetalleEmpresaInput): detalle_entidad
        addEntidadContacto(idContact: String!, idEntidad: String!): detalle_entidad
        deleteEntidadContacto(idContact: String!, idEntidad: String!): detalle_entidad
    }

    type detalle_entidad {
        det_cp_id: Int!
        det_cp_contacto: Int
        det_cp_entidad: String
        contacto: contacto
        entidad:TabEntidad
    }

    input DetalleEmpresaInput {
        det_cp_contacto: Int!
        det_cp_entidad: String!
    }

`

interface dataDetalleEmpresa {
    det_cp_contacto: number,
    det_cp_entidad: string
}

const resolvers = {
    Query: {
        getAllDetalleEmpresa: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.detalle_entidad.findMany()
        },
        getOneDetalleEmpresa: async (_parent: any, _args: { det_cp_id: number }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.detalle_entidad.findUnique({
                where: {
                    det_cp_id: _args.det_cp_id
                }
            })
        },
        getFindDetEntidad: async (_parent: any, _args: { idContact: string }, context: Context) => {
            const userId = getUserId(context)
            if (_args.idContact !== "new") {
                return await context.prisma.detalle_entidad.findMany({
                    where: {
                        det_cp_contacto: parseInt(_args.idContact)
                    }
                })
            }
            return []
        }
    },
    Mutation: {
        createDetalleEmpresa: async (_parent: any, args: { data: dataDetalleEmpresa }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.detalle_entidad.create({
                data: {
                    det_cp_contacto: args.data.det_cp_contacto,
                    det_cp_entidad: args.data.det_cp_entidad
                }
            })
        },
        updateDetalleEmpresa: async (_parent: any, args: { det_cp_id: number, data: dataDetalleEmpresa }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.detalle_entidad.update({
                where: {
                    det_cp_id: args.det_cp_id
                },
                data: {
                    det_cp_contacto: args.data.det_cp_contacto,
                    det_cp_entidad: args.data.det_cp_entidad
                }
            })
        },
        addEntidadContacto: async (_parent: any, args: { idContact: string, idEntidad: string }, context: Context) => {
            const userId = getUserId(context)
            const findContact = await context.prisma.contacto.findUnique({
                where: { contac_id: parseInt(args.idContact) }
            });
            if (!findContact) throw new Error("Contacto no encontrado");

            const findEntidad = await context.prisma.tabEntidad.findUnique({
                where: { IdEmpresa: args.idEntidad }
            });
            if (!findEntidad) throw new Error("Entidad no encontrada");

            const findDetEntidad = await context.prisma.detalle_entidad.findMany({
                where: { det_cp_contacto: parseInt(args.idContact), det_cp_entidad: args.idEntidad }
            });
            if (findDetEntidad.length > 0) throw new Error("Ya existe el contacto en la entidad");

            return await context.prisma.detalle_entidad.create({
                data: {
                    det_cp_contacto: parseInt(args.idContact),
                    det_cp_entidad: args.idEntidad
                }
            })
        },
        deleteEntidadContacto: async (_parent: any, args: { idContact: string, idEntidad: string }, context: Context) => {
            const userId = getUserId(context)
            const findContact = await context.prisma.contacto.findUnique({
                where: { contac_id: parseInt(args.idContact) }
            });
            if (!findContact) throw new Error("Contacto no encontrado");

            const findEntidad = await context.prisma.tabEntidad.findUnique({
                where: { IdEmpresa: args.idEntidad }
            });
            if (!findEntidad) throw new Error("Entidad no encontrada");

            const findDetEntidad = await context.prisma.detalle_entidad.findMany({
                where: { det_cp_contacto: parseInt(args.idContact), det_cp_entidad: args.idEntidad }
            });
            if (findDetEntidad.length === 0) throw new Error("No existe el contacto en la entidad");

            return await context.prisma.detalle_entidad.delete({
                where: {
                    det_cp_id: findDetEntidad[0].det_cp_id
                }
            })
        }
    },
    detalle_entidad: {
        contacto: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.detalle_entidad.findUnique({
                where: {
                    det_cp_id: _parent.det_cp_id
                }
            }).contacto()
        },
        entidad: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.detalle_entidad.findUnique({
                where: {
                    det_cp_id: _parent.det_cp_id
                }
            }).TabEntidad()
        }
    }
}


export { tipeDefs as detalleEmpresaTipeDef, resolvers as detalleEmpresaResolv }