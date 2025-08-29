import { showErrorToast } from "@/common/toast";
import { cloneDeep } from "lodash";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSharedPost, updatePostLike } from "../handlers";

const useSharedPost = () => {
  const params = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postLikesLoading, setPostLikesLoading] = useState(new Map());
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
      showErrorToast(errMessage);
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
      showErrorToast(errMessage);
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

  const postUrlCopiedToClipboard = (postId, postUrl) => {
    const sharableUrl = `${window.location.origin}/shared/${postUrl}`;
    navigator.clipboard
      .writeText(sharableUrl)
      .then(() => {
        console.log("Text copied to clipboard successfully!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });

    setCopiedPostUrlPostId(postId);
    setTimeout(() => setCopiedPostUrlPostId(null), 3000);
  };

  return {
    posts,
    loading,
    postLikesLoading,
    updateUsersPostLikes,
    copiedPostUrlPostId,
    postUrlCopiedToClipboard,
  };
};

export default useSharedPost;
