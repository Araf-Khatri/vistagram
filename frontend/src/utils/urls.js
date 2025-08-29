const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/v1";
export const urls = {
  signup: `${apiUrl}/auth/signup`,
  login: `${apiUrl}/auth/login`,
  refreshToken: `${apiUrl}/auth/refresh_token`,
  loggedInUserDetails: `${apiUrl}/auth/me`,
  logout: `${apiUrl}/auth/logout`,

  getPosts: `${apiUrl}/posts`,
  createPost: `${apiUrl}/posts/create`,
  updatePostLike: `${apiUrl}/posts/<POST_ID>/update_like`,
  createPostShareableLink: `${apiUrl}/posts/<POST_ID>/create_link`,
  sharedPost: `/posts/shared/<POST_URL>`,
};
