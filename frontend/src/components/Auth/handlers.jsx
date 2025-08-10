import catchAsync from "@/utils/catchAsync";
import { API_TOKEN_KEY } from "@/utils/constant";
import { urls } from "@/utils/urls";
import axios from "axios";
import Cookies from "universal-cookie";

export const loginHandler = catchAsync(async (loginCredentials) => {
  const cookies = new Cookies();
  const response = await axios.post(urls.login, loginCredentials, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log(response);

  cookies.set(API_TOKEN_KEY, response.data.data.access_token, {
    expires: new Date(Date.now() + 3600000 * 12), // 12 hour
  });
});

export const signupHandler = catchAsync(async (signupCredentials) => {
  const { username, password } = signupCredentials;
  const cookies = new Cookies();
  const token = cookies.get(API_TOKEN_KEY);
  const response = await axios.post(urls.signup, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username, password }),
  });

  console.log(response);

  cookies.set(API_TOKEN_KEY, response.data.access_token, {
    expires: new Date(Date.now() + 3600000 * 12), // 12 hour
  });
});
