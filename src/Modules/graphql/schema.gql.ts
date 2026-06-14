import {
	GraphQLBoolean,
	GraphQLFloat,
	GraphQLInputObjectType,
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLSchema,
	GraphQLString,
} from "graphql";

export const graphqlSchema = new GraphQLSchema({
	query: new GraphQLObjectType({
		name: "RootQueryType",
		description: "First description optional",
		fields: {
			sayHi: {
				type: GraphQLString,
				resolve() {
					return "Hello From GraphQL API";
				},
			},
			hello: {
				type: new GraphQLObjectType({
					name: "Hello",
					description: "Second description",
					fields: {
						sayHi2: {
							type: GraphQLFloat,
							resolve: () => {
								return 22.5;
							},
						},
						sayHi3: {
							type: GraphQLString,
							resolve: () => {
								return "Hello From SayHi3";
							},
						},
					},
				}),
				resolve(): { message: string } {
					return { message: "Hello From Hello Object Type" };
				},
			},
		},
	}),
	mutation: new GraphQLObjectType({
		name: "GraphQLMutation",
		description: "Mutation Description",
		fields: {
			welcome: {
				type: new GraphQLObjectType({
					name: "welcome",
					description: "Welcome Mutation",
					fields: {
						message: { type: new GraphQLNonNull(GraphQLString) },
					},
				}),
				resolve: (): { message: string } => {
					return { message: "Welcome from mutation" };
				},
			},
			welcome2: {
				type: new GraphQLNonNull(GraphQLString),
				args: {
					searchKey: {
						type: GraphQLString,
						description: "Search Key",
					},
					name: {
						type: new GraphQLNonNull(GraphQLString),
						description: "Name Key",
					},
					data: {
						type: new GraphQLInputObjectType({
							name: "inputs",
							fields: {
								match: { type: GraphQLBoolean },
							},
						}),
						description: "Data Key",
					},
				},
				resolve: (_parent, args): string => {
					return `Welcome from welcome 2 arguments: ${args.searchKey ?? ""} ${args.name ?? ""} ${args.data?.match ?? ""}`.trim();
				},
			},
		},
	}),
});
