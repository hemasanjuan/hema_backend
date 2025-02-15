
//system

import { tbl_ordatencionResolv, tbl_ordatencionTipeDef } from "./tbl_ordatencion"

//laboratorio

const rootTypeDefs = `#graphql
    type Query {
        _: String
    }
    
    type Mutation {
        _: String
    }
`
const resolvers = [
    tbl_ordatencionResolv
]
const typeDefs = [
    rootTypeDefs,
    tbl_ordatencionTipeDef
]

export { typeDefs, resolvers }