import { Query, Resolver } from "type-graphql";

@Resolver()
export class HelloResolver {
  // There we add mutations or queries
  // And we are declaring the type the query returns
  @Query(() => String)
  async hello() {
    return "Hello World!";
  }
}
