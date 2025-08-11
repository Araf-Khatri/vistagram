import axiosInstance from "@/utils/axiosInstance";
import catchAsync from "@/utils/catchAsync";
import { urls } from "@/utils/urls";

export const fetchPosts = catchAsync(async (page = 1, limit = 5) => {
  const response = await axiosInstance.get(urls.getPosts, {
    params: {
      page,
      limit,
    },
  });
  return response.data.data;
});

export const createPost = catchAsync(async (postDetails) => {
  const image = postDetails.image;
  const caption = postDetails.caption.trim();
  await axiosInstance.post(urls.createPost, {
    image,
    caption,
  });
});

export const updatePostLike = catchAsync(async (postId) => {
  const url = urls.updatePostLike.replace("<POST_ID>", postId);
  const response = await axiosInstance.post(url);
  const data = response.data.data || {};
  const liked_by_user = data?.liked || false;
  const likes_count = data?.total_likes || 0;

  return {
    liked_by_user,
    likes_count,
  };
});

export const getSharedPost = catchAsync(async (postUrl) => {
  const url = urls.sharedPost.replace("<POST_URL>", postUrl);

  const response = await axiosInstance.get(url);
  return response.data.data;
});
