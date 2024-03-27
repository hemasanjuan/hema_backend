
import { context, Context } from '../../context';
import { DateTimeResolver, DateTimeTypeDefinition } from 'graphql-scalars'
import { convertDateTimeV2, getUserId } from "../../utils";
import moment from "moment-timezone";

const tipeDefs = `#graphql

    extend type Query {
        getAllCanal: [TabCanal!]!
        getOneCanal(IdCanal: Int): TabCanal
        getCanalDate(idCanal: Int): dateCanal
    }

    extend type Mutation {
        createCanal(data:canalInput): TabCanal
        updateCanal(IdCanal: Int!, data:canalInput): TabCanal
    }

    type dateCanal {
        IdCanal: Int!
        Descripcion: String
        date: DateTime
    }

    type TabCanal {
        IdCanal: Int!
        Descripcion: String
        Activo: Boolean
        solicitudAtencion: [solicitud_atencion!]!
    }

    input canalInput {
        Descripcion: String,
        Activo: Boolean,
    }

    scalar DateTime
`

interface dataCanal {
    Descripcion: string,
    Activo: boolean,
}
const resolvers = {

    Query: {
        getAllCanal: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabCanal.findMany()
        },
        getOneCanal: async (_parent: any, _args: { IdCanal: number }, context: Context) => {
            const userId = getUserId(context)
            //demo01
            // const now = new Date(convertDateTimeV2("2022-10-06T20:10:40.433Z"));
            // const now = new Date("2022-10-06T20:10:40.433Z");
            // const now = new Date();
            // const opciones: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Lima' };
            // const formatter = new Intl.DateTimeFormat('es-PE', opciones);
            // const formattedDate = formatter.format(now);
            // console.log(formattedDate);
            //=> DEMO 02
            // const now = moment();
            // console.log(now.format());

            return await context.prisma.tabCanal.findUnique({
                where: {
                    IdCanal: _args.IdCanal
                }
            })
        },
        getCanalDate: async (_parent: any, _args: { IdCanal: number }, context: Context) => {
            const userId = getUserId(context)
            const resp: any = await context.prisma.tabCanal.findUnique({
                where: {
                    IdCanal: _args.IdCanal
                }
            })
            console.log(resp)
            return {
                IdCanal: resp?.IdCanal,
                Descripcion: resp?.Descripcion,
                date: new Date()
            }
        },
    },
    Mutation: {
        createCanal: async (_parent: any, args: { data: dataCanal }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabCanal.create({
                data: {
                    Descripcion: args.data.Descripcion,
                    Activo: args.data.Activo
                }
            })
        },
        updateCanal: async (_parent: any, args: { IdCanal: number, data: dataCanal }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.tabCanal.update({
                where: {
                    IdCanal: args.IdCanal
                },
                data: {
                    Descripcion: args.data.Descripcion,
                    Activo: args.data.Activo
                }
            })
        }
    },
    TabCanal: {
        solicitudAtencion: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.tabCanal.findUnique({
                where: {
                    IdCanal: _parent.IdCanal
                }
            }).solicitud_atencion()
        }
    }
}

export { tipeDefs as tabCanalTipeDef, resolvers as tabCanalResolv }