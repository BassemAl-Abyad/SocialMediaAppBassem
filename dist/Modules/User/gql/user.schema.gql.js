"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userGqlSchema = void 0;
const graphql_1 = require("graphql");
const user_resolver_1 = require("./user.resolver");
class UserGqlSchema {
    resolver;
    constructor() {
        this.resolver = user_resolver_1.userResolver;
    }
    registerQuery() {
        return {
            profile: {
                type: graphql_1.GraphQLString,
                args: {},
                resolve: this.resolver.getProfile,
            },
        };
    }
    registerMutation() {
        return {
            sayHi: {
                type: graphql_1.GraphQLString,
                args: {},
                resolve() {
                    return "Hi there!";
                },
            },
        };
    }
}
exports.userGqlSchema = new UserGqlSchema();
