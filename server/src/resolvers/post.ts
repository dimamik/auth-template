import { MyExpressContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@Resolver()
export class PostResolver {
  // There we add mutations or queries
  // And we are declaring the type the query returns
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    // sleep for 1 second
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  // Check if user is logged in
  @UseMiddleware(isAuth)
  async createPost(
    @Ctx() { req }: MyExpressContext,
    @Arg("input") input: PostInput
  ): Promise<Post | null> {
    const post = Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (title) {
      await Post.update(id, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    if (id) {
      const post = await Post.findOne(id);
      if (post) {
        await Post.delete(id);
        return true;
      }
    }
    return false;
  }
}
