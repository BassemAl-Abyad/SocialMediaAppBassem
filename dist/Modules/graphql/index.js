"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphqlHandler = exports.graphqlSchema = void 0;
const express_1 = require("graphql-http/lib/use/express");
const schema_gql_1 = require("./schema.gql");
var schema_gql_2 = require("./schema.gql");
Object.defineProperty(exports, "graphqlSchema", { enumerable: true, get: function () { return schema_gql_2.graphqlSchema; } });
exports.graphqlHandler = (0, express_1.createHandler)({ schema: schema_gql_1.graphqlSchema });
