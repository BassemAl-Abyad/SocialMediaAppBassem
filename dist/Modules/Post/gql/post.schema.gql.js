"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postGqlSchema = void 0;
const graphql_1 = require("graphql");
const post_resolver_1 = require("./post.resolver");
const post_types_gql_1 = require("./post.types.gql");
class PostGqlSchema {
    resolver;
    constructor() {
        this.resolver = post_resolver_1.postResolver;
    }
    registerQuery() {
        return {
            posts: {
                type: new graphql_1.GraphQLList(post_types_gql_1.postType),
                args: {},
                resolve: this.resolver.getPosts,
            },
        };
    }
}
exports.postGqlSchema = new PostGqlSchema();
