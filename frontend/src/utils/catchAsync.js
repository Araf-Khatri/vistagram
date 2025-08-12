const catchAsync = (fn) => {
  return async (...params) =>
    fn(...params)
      .then((res) => res)
      .catch((error) => {
        console.log(error.response);
        throw error; // Re-throw the error for further handling
      });
};

export default catchAsync;
