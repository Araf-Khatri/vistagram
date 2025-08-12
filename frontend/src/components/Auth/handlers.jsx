import axiosInstance, { API_TOKEN_KEY } from "@/utils/axiosInstance";
import catchAsync from "@/utils/catchAsync";
import { urls } from "@/utils/urls";

export const loginHandler = catchAsync(async (loginCredentials) => {
  const response = await axiosInstance.post(urls.login, loginCredentials);

  const token = response.data.data.access_token;
  localStorage.setItem(API_TOKEN_KEY, token);
});

export const signupHandler = catchAsync(async (signupCredentials) => {
  const response = await axiosInstance.post(urls.signup, signupCredentials);

  const token = response.data.data.access_token;
  localStorage.setItem(API_TOKEN_KEY, token);
});

export const getLoggedInUser = catchAsync(async () => {
  const response = await axiosInstance.get(urls.loggedInUserDetails);

  return response.data.data;
});
