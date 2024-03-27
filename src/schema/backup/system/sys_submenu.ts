
import { context, Context } from '../../context'
import { getUserId } from "../../utils";


const tipeDefs = `#graphql

extend type Query {
    getAllSubMenu: [sys_submenu!]!
    getOneSubMenu(submenu_id: String): sys_submenu
}

extend type Mutation {
    crearSubMenu(submenu_id: String!,submenu_menu: String!,submenu_desc: String!,submenu_icon: String): sys_submenu
    updateSubMenu(submenu_id: String!,submenu_menu: String!,submenu_desc: String!,submenu_icon: String): sys_submenu
}


type sys_submenu {
    submenu_id: String!
    submenu_desc: String!
    submenu_menu: String!
    submenu_icon: String    
    menu: sys_menu!
}

`

const resolvers = {
    Query: {
        getAllSubMenu: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_submenu.findMany()
        },
        getOneSubMenu: async (_parent: any, _args: { submenu_id: string }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_submenu.findUnique({
                where: {
                    submenu_id: _args.submenu_id
                }
            })
        }
    },
    Mutation: {
        crearSubMenu: async (_parent: any, _args: { submenu_id: string, submenu_menu: string, submenu_desc: string, submenu_icon: string }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_submenu.create({
                data: {
                    submenu_id: _args.submenu_id,
                    submenu_menu: _args.submenu_menu,
                    submenu_desc: _args.submenu_desc,
                    submenu_icon: _args.submenu_icon
                }
            })
        },
        updateSubMenu: async (_parent: any, _args: { submenu_id: string, submenu_menu: string, submenu_desc: string, submenu_icon: string }, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_submenu.update({
                where: {
                    submenu_id: _args.submenu_id
                },
                data: {
                    submenu_menu: _args.submenu_menu,
                    submenu_desc: _args.submenu_desc,
                    submenu_icon: _args.submenu_icon
                }
            })
        }
    },
    sys_submenu: {
        menu: async (_parent: any, _args: any, context: Context) => {
            const userId = getUserId(context)
            return await context.prisma.sys_submenu.findUnique({
                where: {
                    submenu_id: _parent.submenu_id
                }
            }).sys_menu()
        }
    }
}

export { tipeDefs as sysSubMenuTipeDef, resolvers as sysSubMenuResolv }