import axiosInstance, { API_TOKEN_KEY } from "../../utils/axiosInstance";
import catchAsync from "../../utils/catchAsync";
import { urls } from "../../utils/urls";

export const signupHandler = catchAsync(async (signupCredentials) => {
  const response = await axiosInstance.post(urls.signup, signupCredentials);
  const userDetails = response.data.data;
  const token = userDetails.access_token;
  localStorage.setItem(API_TOKEN_KEY, token);

  return {
    id: userDetails.id,
    username: userDetails.username,
  };
});

export const loginHandler = catchAsync(async (loginCredentials) => {
  const response = await axiosInstance.post(urls.login, loginCredentials);
  const userDetails = response.data.data;
  const token = userDetails.access_token;
  localStorage.setItem(API_TOKEN_KEY, token);

  return {
    id: userDetails.id,
    username: userDetails.username,
  };
});

export const refreshUserToken = catchAsync(async () => {
  const response = await axiosInstance.post(urls.refreshToken);
  const userDetails = response?.data?.data;
  const token = userDetails?.access_token;
  localStorage.setItem(API_TOKEN_KEY, token);

  return true;
});

export const getLoggedInUser = catchAsync(async () => {
  const response = await axiosInstance.get(urls.loggedInUserDetails);
  return response.data.data;
});

export const logoutHandler = catchAsync(async () => {
  await axiosInstance.post(urls.logout);
  localStorage.removeItem(API_TOKEN_KEY);

  return true;
});
