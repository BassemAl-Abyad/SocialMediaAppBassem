"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphqlHandler = void 0;
const express_1 = require("graphql-http/lib/use/express");
const schema_gql_1 = require("./schema.gql");
exports.graphqlHandler = (0, express_1.createHandler)({ schema: schema_gql_1.schema });
