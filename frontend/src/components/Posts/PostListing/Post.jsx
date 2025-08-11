import { FaShare } from "react-icons/fa";
import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import styled from "styled-components";

const Card = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  background: white;
`;

const PostImage = styled.img`
  border-radius: 6px;
  width: 100%;
`;

const Caption = styled.p`
  font-size: 0.875rem;
`;

const User = styled.span`
  display: inline-block;
  margin-right: 0.2rem;
  font-weight: 600;
`;

const Row = styled.div`
  margin-top: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LeftGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const RightGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: end;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0.25rem;
  margin-right: ${({ mr }) => mr || "0"};
  font-size: 1.25rem;
  cursor: pointer;
  border-radius: 50%;
  color: ${({ color }) => color || "inherit"};
  transition: background 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const Likes = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
`;

const Shares = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
`;

export default function Post({
  post,
  updateUsersPostLikes,
  likeLoading = true,
  sharePost,
  urlCopied,
}) {
  const {
    id,
    image_url,
    caption,
    share_count,
    likes_count,
    liked_by_user,
    posted_by,
  } = post;

  return (
    <Card key={id}>
      <PostImage src={image_url} alt={caption} />
      <Caption>
        <User>{posted_by}</User>
        {caption}
      </Caption>
      <Row>
        <LeftGroup>
          {liked_by_user || likeLoading ? (
            <IconButton
              disabled={likeLoading}
              onClick={() => updateUsersPostLikes(id)}
              color={likeLoading ? "#757575" : "deeppink"}
              aria-label="Like"
            >
              <IoMdHeart />
            </IconButton>
          ) : (
            <IconButton
              onClick={() => updateUsersPostLikes(id)}
              aria-label="Like"
            >
              <IoMdHeartEmpty />
            </IconButton>
          )}
          <Likes>{likes_count}</Likes>
        </LeftGroup>
        <RightGroup onClick={sharePost}>
          <IconButton color="dodgerblue" aria-label="Share">
            <FaShare />
          </IconButton>
          {urlCopied ? <span>copied</span> : <Shares>{share_count}</Shares>}
        </RightGroup>
      </Row>
    </Card>
  );
}
