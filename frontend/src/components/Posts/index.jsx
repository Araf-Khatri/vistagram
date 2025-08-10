import Post from "./Post";
import usePostList from "./usePostList";

const Posts = () => {
  const { setRef, posts, loading, error } = usePostList();

  return (
    <div className="posts-container">
      <h1>Posts</h1>
      {error && <div>Error loading posts: {error.message}</div>}
      <Stack spacing={6}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {posts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </>
        )}
        <div ref={setRef} />
      </Stack>
    </div>
  );
};

export default Posts;
