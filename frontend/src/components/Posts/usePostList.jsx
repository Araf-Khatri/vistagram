import { useEffect, useState } from "react";
import { fetchPosts } from "./handlers";

const usePostList = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ref, setRef] = useState(null);

  const loadPosts = async (page) => {
    setLoading(true);
    try {
      const newPosts = await fetchPosts(page);
      console.log("Fetched posts:", newPosts);
      setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setPage((prevPage) => prevPage + 1);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ref?.current) return;
    const intersectionObserver = new IntersectionObserver(
      async (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            setPage((prevPage) => prevPage + 1);
          }
        });
      },
      { threshold: 1 }
    );
    if (ref?.current) {
      intersectionObserver.observe(ref.current);
    }
  }, [ref]);

  useEffect(() => {
    loadPosts(page);
  }, [page]);

  return { setRef, posts, loading, error };
};

export default usePostList;
