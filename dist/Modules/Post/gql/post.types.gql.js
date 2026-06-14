"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postType = exports.userSummaryType = void 0;
const graphql_1 = require("graphql");
exports.userSummaryType = new graphql_1.GraphQLObjectType({
    name: "PostUserSummary",
    fields: {
        _id: { type: graphql_1.GraphQLID },
        firstName: { type: graphql_1.GraphQLString },
        lastName: { type: graphql_1.GraphQLString },
        username: { type: graphql_1.GraphQLString },
        ProfilePic: { type: graphql_1.GraphQLString },
    },
});
exports.postType = new graphql_1.GraphQLObjectType({
    name: "Post",
    fields: {
        _id: { type: graphql_1.GraphQLID },
        folderId: { type: graphql_1.GraphQLString },
        content: { type: graphql_1.GraphQLString },
        attachments: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        availability: { type: graphql_1.GraphQLInt },
        createdBy: { type: exports.userSummaryType },
        tags: { type: new graphql_1.GraphQLList(exports.userSummaryType) },
        deletedAt: { type: graphql_1.GraphQLString },
        restoredAt: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
        hasContent: {
            type: graphql_1.GraphQLBoolean,
            resolve: (post) => Boolean(post.content || post.attachments?.length),
        },
    },
});
