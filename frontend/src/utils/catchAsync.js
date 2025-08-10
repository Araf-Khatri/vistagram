const catchAsync = (fn) => {
  return (...params) => {
    fn(...params).catch((error) => {
      if (error.response.status === 401) {
        // const cookies = new Cookies();
        // cookies.remove(API_TOKEN_KEY, { path: "/" });
        // window.location.href = "/login"; // Redirect to login if unauthorized
      } else {
        console.error("An error occurred:", error);
        throw error; // Re-throw the error for further handling
      }
    });
  };
};

export default catchAsync;
