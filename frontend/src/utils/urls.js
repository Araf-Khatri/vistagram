const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/v1";
export const urls = {
  login: `${apiUrl}/auth/login`,
  signup: `${apiUrl}/auth/signup`,

  getPosts: `${apiUrl}/posts`,
};
