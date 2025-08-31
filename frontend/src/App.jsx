import { useContext, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Authentication from "./components/Auth";
import { getLoggedInUser, refreshUserToken } from "./components/Auth/handlers";
import CreatePost from "./components/Posts/CreatePost";
import PostListing from "./components/Posts/PostListing";
import SharedPost from "./components/Posts/SharedPost";
import UserContext from "./context/userContext";
import HomeLayout from "./layout/HomeLayout";
import { API_TOKEN_KEY } from "./utils/axiosInstance";

function App() {
  const location = useLocation();
  const { userDetails, setUserDetails } = useContext(UserContext);
  const { userFound } = userDetails;

  useEffect(() => {
    if (!["/login", "/signup"].includes(location.pathname)) {
      refreshUserToken()
        .then(() => getUserDetails())
        .catch(() => {
          setUserDetails((prev) => ({ ...prev, userFound: false }));
          localStorage.removeItem(API_TOKEN_KEY);
        });
    }
  }, []);

  const getUserDetails = async () => {
    try {
      const userDetails = await getLoggedInUser();
      setUserDetails({ ...userDetails, userFound: true });
    } catch (_) {
      setUserDetails((prev) => ({ ...prev, userFound: false }));
    }
  };

  return (
    <Routes>
      {!userFound && (
        <>
          <Route path="/login" element={<Authentication type="login" />} />
          <Route path="/signup" element={<Authentication type="signup" />} />
        </>
      )}

      {userFound && (
        <Route element={<HomeLayout />}>
          <Route path="/create" element={<CreatePost />} />
          <Route path="/shared/:post_url" element={<SharedPost />} />
          <Route path="/" element={<PostListing />} />
        </Route>
      )}
    </Routes>
  );
}

export default App;
