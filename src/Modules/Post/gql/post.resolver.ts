import { HUserDocument } from "../../../DB/Models/user.model";
import postService from "../post.service";

export class PostResolver {
	getPosts = async (_: unknown, __: unknown, { user }: { user: HUserDocument }) => {
		return await postService.getPosts(user);
	};
}

export const postResolver = new PostResolver();
