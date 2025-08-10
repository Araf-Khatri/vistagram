import catchAsync from "@/utils/catchAsync";
import { API_TOKEN_KEY } from "@/utils/constant";
import { urls } from "@/utils/urls";
import axios from "axios";
import Cookies from "universal-cookie";

export const fetchPosts = catchAsync(async (page = 1, limit = 10) => {
  const cookies = new Cookies();
  const token = cookies.get(API_TOKEN_KEY);

  const response = await axios.get(urls.getPosts, {
    params: {
      page,
      limit,
    },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });
  return response.data.data;
});
