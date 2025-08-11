import { API_TOKEN_KEY } from "./axiosInstance";

const catchAsync = (fn) => {
  return async (...params) =>
    fn(...params)
      .then((res) => res)
      .catch((error) => {
        if (error.response.status === 401) {
          localStorage.removeItem(API_TOKEN_KEY);
        } else {
          console.error("An error occurred:", error);
        }
        throw error; // Re-throw the error for further handling
      });
};

export default catchAsync;
