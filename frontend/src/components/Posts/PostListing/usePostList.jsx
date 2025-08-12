import { cloneDeep } from "lodash";
import { useEffect, useState } from "react";
import { fetchPosts, updatePostLike } from "../handlers";

const LIMIT = 10;
const usePostList = () => {
  const [posts, setPosts] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [postLikesLoading, setPostLikesLoading] = useState(new Map());
  const [copiedPostUrlPostId, setCopiedPostUrlPostId] = useState(null);
  const [error, setError] = useState(null);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;
    const intersectionObserver = new IntersectionObserver(
      async (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            const totalPage = Math.ceil(metadata?.total_records / LIMIT);
            setPage((prevPage) => {
              if (prevPage >= totalPage) return prevPage;
              return prevPage + 1;
            });
          }
        });
      },
      { threshold: 1 }
    );
    if (ref) {
      intersectionObserver.observe(ref);
    }
  }, [ref, metadata?.total_records]);

  useEffect(() => {
    loadPosts(page);
  }, [page]);

  const loadPosts = async (page) => {
    setLoading(true);
    try {
      const response = await fetchPosts(page);
      const newPosts = response.records;
      const metadata = response.metadata;
      setMetadata(metadata);
      setPosts((prevPosts) => [...prevPosts, ...(newPosts || [])]);
    } catch (err) {
      setError(err);
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
      setError("Unable to update likes");
    } finally {
      setPostLikesLoading((prev) => {
        const newMap = cloneDeep(prev);
        newMap.delete(postId);
        return newMap;
      });
    }
  };

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
    setRef,
    posts,
    loading,
    error,
    postLikesLoading,
    updateUsersPostLikes,
    postUrlCopiedToClipboard,
    copiedPostUrlPostId,
  };
};

export default usePostList;
