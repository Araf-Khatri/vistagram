import { Link } from "react-router-dom";
import styled from "styled-components";
import Post from "../PostListing/Post";
import useSharedPost from "./useSharedPost";

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

export const Text = styled.span`
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  width: fit-content;
`;

export default function SharedPost() {
  const {
    posts,
    loading,
    updateUsersPostLikes,
    postLikesLoading,
    postUrlCopiedToClipboard,
    copiedPostUrlPostId,
  } = useSharedPost();

  return (
    <PostsContainer>
      <Title>Shared Post</Title>
      <Stack>
        {loading ? (
          <Loading>Loading...</Loading>
        ) : (
          posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              updateUsersPostLikes={updateUsersPostLikes}
              likeLoading={postLikesLoading.get(post.id) || false}
              sharePost={() => postUrlCopiedToClipboard(post.id, post.post_url)}
              urlCopied={copiedPostUrlPostId === post.id}
            />
          ))
        )}
        <Text>
          See other <Link to={"/"}>posts</Link>
        </Text>
      </Stack>
    </PostsContainer>
  );
}
