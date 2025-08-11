const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/v1";
export const urls = {
  login: `${apiUrl}/auth/login`,
  signup: `${apiUrl}/auth/signup`,
  loggedInUserDetails: `${apiUrl}/auth/me`,

  getPosts: `${apiUrl}/posts`,
  createPost: `${apiUrl}/posts/create`,
  updatePostLike: `${apiUrl}/posts/<POST_ID>/update_like`,
  sharedPost: `/posts/shared/<POST_URL>`,
};
