import { ErrorMessage } from "@/common/styles";
import styled from "styled-components";
import Post from "./Post";
import usePostList from "./usePostList";

const PostsContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
  @media (max-width: 768px) {
    margin: 1rem 0;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Loading = styled.div`
  font-size: 1rem;
  color: gray;
`;

const EndScreen = styled.div`
  height: 1px;
  width: 100%;
`;

export default function Posts() {
  const {
    setRef,
    posts,
    loading,
    error,
    updateUsersPostLikes,
    postLikesLoading,
    postUrlCopiedToClipboard,
    copiedPostUrlPostId,
  } = usePostList();

  return (
    <PostsContainer>
      <Title>Posts</Title>
      {error && (
        <ErrorMessage>Error loading posts: {error.message}</ErrorMessage>
      )}
      <Stack>
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            updateUsersPostLikes={updateUsersPostLikes}
            likeLoading={postLikesLoading.get(post.id) || false}
            sharePost={() => postUrlCopiedToClipboard(post.id, post.post_url)}
            urlCopied={copiedPostUrlPostId === post.id}
          />
        ))}
      </Stack>
      {loading && <Loading />}
      {!loading && <EndScreen ref={setRef} />}
    </PostsContainer>
  );
}
