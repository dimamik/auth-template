import { withUrqlClient } from "next-urql";
import { NavBar } from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = ({}) => {
  const [{ data }] = usePostsQuery();

  return (
    <>
      <NavBar />
      <div>Hello world</div>
      {!data ? (
        <div>loading...</div>
      ) : (
        data.posts.map((post) => <div key={post.id}>{post.title}</div>)
      )}
    </>
  );
};

// Ther is server side rendering happens!
export default withUrqlClient(createUrqlClient)(Index);
