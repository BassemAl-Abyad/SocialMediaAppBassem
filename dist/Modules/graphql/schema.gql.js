"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const graphql_1 = require("graphql");
const post_schema_gql_1 = require("../Post/gql/post.schema.gql");
const user_schema_gql_1 = require("../User/gql/user.schema.gql");
const query = new graphql_1.GraphQLObjectType({
    name: "RootQueryType",
    description: "First description optional",
    fields: {
        ...post_schema_gql_1.postGqlSchema.registerQuery(),
        ...user_schema_gql_1.userGqlSchema.registerQuery(),
    },
});
const mutation = new graphql_1.GraphQLObjectType({
    name: "RootSchemaMutation",
    description: "Second description optional",
    fields: {
    // fields here
    },
});
exports.schema = new graphql_1.GraphQLSchema({ query, mutation });
