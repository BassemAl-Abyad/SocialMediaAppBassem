"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphqlSchema = void 0;
const graphql_1 = require("graphql");
exports.graphqlSchema = new graphql_1.GraphQLSchema({
    query: new graphql_1.GraphQLObjectType({
        name: "RootQueryType",
        description: "First description optional",
        fields: {
            sayHi: {
                type: graphql_1.GraphQLString,
                resolve() {
                    return "Hello From GraphQL API";
                },
            },
            hello: {
                type: new graphql_1.GraphQLObjectType({
                    name: "Hello",
                    description: "Second description",
                    fields: {
                        sayHi2: {
                            type: graphql_1.GraphQLFloat,
                            resolve: () => {
                                return 22.5;
                            },
                        },
                        sayHi3: {
                            type: graphql_1.GraphQLString,
                            resolve: () => {
                                return "Hello From SayHi3";
                            },
                        },
                    },
                }),
                resolve() {
                    return { message: "Hello From Hello Object Type" };
                },
            },
        },
    }),
    mutation: new graphql_1.GraphQLObjectType({
        name: "GraphQLMutation",
        description: "Mutation Description",
        fields: {
            welcome: {
                type: new graphql_1.GraphQLObjectType({
                    name: "welcome",
                    description: "Welcome Mutation",
                    fields: {
                        message: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                    },
                }),
                resolve: () => {
                    return { message: "Welcome from mutation" };
                },
            },
            welcome2: {
                type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
                args: {
                    searchKey: {
                        type: graphql_1.GraphQLString,
                        description: "Search Key",
                    },
                    name: {
                        type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
                        description: "Name Key",
                    },
                    data: {
                        type: new graphql_1.GraphQLInputObjectType({
                            name: "inputs",
                            fields: {
                                match: { type: graphql_1.GraphQLBoolean },
                            },
                        }),
                        description: "Data Key",
                    },
                },
                resolve: (_parent, args) => {
                    return `Welcome from welcome 2 arguments: ${args.searchKey ?? ""} ${args.name ?? ""} ${args.data?.match ?? ""}`.trim();
                },
            },
        },
    }),
});
