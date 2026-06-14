import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { postGqlSchema } from "../Post/gql/post.schema.gql";
import { userGqlSchema } from "../User/gql/user.schema.gql";

const query = new GraphQLObjectType({
    name: "RootQueryType",
    description: "First description optional",
    fields: {
        ...postGqlSchema.registerQuery(),
        ...userGqlSchema.registerQuery(),
    },
});

const mutation = new GraphQLObjectType({
    name: "RootSchemaMutation",
    description: "Second description optional",
    fields: {
        // fields here
    },
});

export const schema = new GraphQLSchema({ query, mutation });