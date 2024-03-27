
import { context, Context } from '../../context'
import { getUserId } from "../../utils";

const tipeDefs = `#graphql

    extend type Query {
        getAllMenu: [sys_menu!]!
        getOneMenu(menu_id: String): sys_menu
    }

    extend type Mutation {
        createMenu(menu_id: String!, menu_desc: String!): sys_menu
        updateMenu(menu_id: String!,menu_desc: String!): sys_menu
    }

    type sys_menu {
        menu_id: String!
        menu_desc: String
        subMenu: [sys_submenu!]!
    }
`

const resolvers = {
    Query: {
        getAllMenu: async (_parent: any, _args: any, context: Context) => {
            // const userId = getUserId(context)
            return await context.prisma.sys_menu.findMany()
            // return context.prisma.$queryRaw`select * from sys_menu`
        },
        getOneMenu: async (_parent: any, _args: { menu_id: string }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_menu.findUnique({
                where: {
                    menu_id: _args.menu_id
                }
            })
        }
    },
    Mutation: {
        createMenu: async (_parent: any, args: { menu_id: string, menu_desc: string }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_menu.create({
                data: {
                    menu_id: args.menu_id,
                    menu_desc: args.menu_desc
                }

            })
        },
        updateMenu: async (_parent: any, args: { menu_id: string, menu_desc: string }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_menu.update({
                where: {
                    menu_id: args.menu_id
                },
                data: {
                    menu_desc: args.menu_desc
                }
            })
        }
    },
    sys_menu: {
        subMenu: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_menu.findUnique({
                where: {
                    menu_id: _parent.menu_id
                }
            }).sys_submenu()
        }
    }
}


export { tipeDefs as sysMenuTipeDef, resolvers as sysMenuResolv }