import { useContext, useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { userDetails, setUserDetails } = useContext(UserContext);
  const [tokenRefreshed, setTokenRefreshed] = useState(false);
  const { userFound } = userDetails;

  useEffect(() => {
    if (tokenRefreshed) return;
    const isAuthPage = ["/login", "/signup"].includes(location.pathname);

    if (!isAuthPage) {
      refreshUserToken()
        .then(() => setTokenRefreshed(true))
        .then(() => getUserDetails())
        .catch(() => {
          setUserDetails((prev) => ({ ...prev, userFound: false }));
          localStorage.removeItem(API_TOKEN_KEY);
        });
    } else if (isAuthPage && localStorage.getItem(API_TOKEN_KEY)) {
      navigate("/", { replace: true, state: { refresh: true } });
    }
  }, [tokenRefreshed, navigate]);

  const getUserDetails = async () => {
    try {
      const userDetails = await getLoggedInUser();
      setUserDetails({ ...userDetails, userFound: true });
    } catch (_) {
      setUserDetails((prev) => ({ ...prev, userFound: false }));
    }
  };

  console.log(userDetails);

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
