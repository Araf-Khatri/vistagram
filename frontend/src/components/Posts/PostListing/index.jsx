import styled from "styled-components";
import { ErrorMessage } from "../../../common/styles";
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

const Observer = styled.div`
  height: 1px;
  width: 100%;
`;

export default function PostListing() {
  const {
    setRef,
    posts,
    loading,
    error,
    updateUsersPostLikes,
    disablePostsShareIcon,
    postLikesLoading,
    copyPostShareableLink,
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
            sharePost={() => copyPostShareableLink(post.id)}
            urlCopied={copiedPostUrlPostId === post.id}
            shareIconDisabled={disablePostsShareIcon.get(post.id) || false}
          />
        ))}
      </Stack>
      {loading && <Loading />}
      {!loading && <Observer ref={setRef} />}
    </PostsContainer>
  );
}
