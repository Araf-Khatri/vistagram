import { cloneDeep } from "lodash";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "../../../common/toast";
import { generatePostLink, getSharedPost, updatePostLike } from "../handlers";

const useSharedPost = () => {
  const params = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postLikesLoading, setPostLikesLoading] = useState(new Map());
  const [disablePostsShareIcon, setDisablePostsShareIcon] = useState(new Map());
  const [copiedPostUrlPostId, setCopiedPostUrlPostId] = useState(null);

  const loadPost = async () => {
    setLoading(true);
    try {
      const post = await getSharedPost(params.post_url);
      setPosts([post]);
    } catch (err) {
      const errMessage =
        err?.response?.data?.message ||
        `Error status code: ${err?.response?.status}`;
      showErrorToast({ message: errMessage });
    } finally {
      setLoading(false);
    }
  };

  const updateUsersPostLikes = async (postId) => {
    try {
      setPostLikesLoading((prev) => {
        const newMap = cloneDeep(prev);
        newMap.set(postId, true);
        return newMap;
      });

      const updatedPostObject = await updatePostLike(postId);
      setPosts((prev) => {
        const newPosts = cloneDeep(prev);
        const mappedPosts = newPosts.map((post) =>
          post.id === postId ? { ...post, ...updatedPostObject } : post
        );
        return mappedPosts;
      });
    } catch (err) {
      const errMessage =
        err?.response?.data?.message ||
        `Error status code: ${err?.response?.status}`;
      showErrorToast({ message: errMessage });
    } finally {
      setPostLikesLoading((prev) => {
        const newMap = cloneDeep(prev);
        newMap.delete(postId);
        return newMap;
      });
    }
  };

  useEffect(() => {
    loadPost(params.post_url);
  }, []);

  const copyPostShareableLink = async (postId) => {
    try {
      setDisablePostsShareIcon((prev) => {
        const newMap = cloneDeep(prev);
        newMap.set(postId, true);
        return newMap;
      });
      const { link: postUrl } = await generatePostLink(postId);
      const sharableUrl = `${window.location.origin}/shared/${postUrl}`;
      navigator.clipboard
        .writeText(sharableUrl)
        .then(() => {
          showSuccessToast({
            message: "Text copied to clipboard successfully!",
          });
        })
        .catch((_) => {
          const errMessage = "Failed to copy url";
          showErrorToast({ message: errMessage });
        });

      setCopiedPostUrlPostId(postId);
      setTimeout(() => setCopiedPostUrlPostId(null), 3000);
    } catch (err) {
      const errMessage =
        err?.response?.data?.message ||
        `Error status code: ${err?.response?.status}`;
      showErrorToast({ message: errMessage });
    } finally {
      setDisablePostsShareIcon((prev) => {
        const newMap = cloneDeep(prev);
        newMap.delete(postId);
        return newMap;
      });
    }
  };

  return {
    posts,
    loading,
    postLikesLoading,
    updateUsersPostLikes,
    disablePostsShareIcon,
    copiedPostUrlPostId,
    copyPostShareableLink,
  };
};

export default useSharedPost;
