import { GraphQLList } from "graphql";
import { postResolver, PostResolver } from "./post.resolver";
import { postType } from "./post.types.gql";

class PostGqlSchema {
	private readonly resolver: PostResolver;

	constructor() {
		this.resolver = postResolver;
	}

	registerQuery() {
		return {
			posts: {
				type: new GraphQLList(postType),
				args: {},
				resolve: this.resolver.getPosts,
			},
		};
	}
}

export const postGqlSchema = new PostGqlSchema();
