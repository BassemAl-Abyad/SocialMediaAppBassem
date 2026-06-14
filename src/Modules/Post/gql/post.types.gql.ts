import {
	GraphQLBoolean,
	GraphQLID,
	GraphQLInt,
	GraphQLList,
	GraphQLObjectType,
	GraphQLString,
} from "graphql";

export const userSummaryType = new GraphQLObjectType({
	name: "PostUserSummary",
	fields: {
		_id: { type: GraphQLID },
		firstName: { type: GraphQLString },
		lastName: { type: GraphQLString },
		username: { type: GraphQLString },
		ProfilePic: { type: GraphQLString },
	},
});

export const postType = new GraphQLObjectType({
	name: "Post",
	fields: {
		_id: { type: GraphQLID },
		folderId: { type: GraphQLString },
		content: { type: GraphQLString },
		attachments: { type: new GraphQLList(GraphQLString) },
		availability: { type: GraphQLInt },
		createdBy: { type: userSummaryType },
		tags: { type: new GraphQLList(userSummaryType) },
		deletedAt: { type: GraphQLString },
		restoredAt: { type: GraphQLString },
		createdAt: { type: GraphQLString },
		updatedAt: { type: GraphQLString },
		hasContent: {
			type: GraphQLBoolean,
			resolve: (post: { content?: string; attachments?: string[] }) =>
				Boolean(post.content || post.attachments?.length),
		},
	},
});
