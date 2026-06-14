"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserGqlSchema = void 0;
const graphql_1 = require("graphql");
class UserGqlSchema {
    registerQuery() {
        return {
        // fields here
        };
    }
    registerMutation() {
        return {
            sayHi: {
                type: graphql_1.GraphQLString,
                resolve() {
                    return "Hi there!";
                },
            },
        };
    }
}
exports.UserGqlSchema = UserGqlSchema;
