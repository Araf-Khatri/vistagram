import { useContext, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Authentication from "./components/Auth";
import { getLoggedInUser, refreshUserToken } from "./components/Auth/handlers";
import CreatePost from "./components/Posts/CreatePost";
import PostListing from "./components/Posts/PostListing";
import SharedPost from "./components/Posts/SharedPost";
import UserContext from "./context/userContext";
import HomeLayout from "./layout/HomeLayout";
import { API_TOKEN_KEY } from "./utils/axiosInstance";

function App() {
  const { userDetails, setUserDetails } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const { userFound } = userDetails;

  useEffect(() => {
    if (localStorage.getItem(API_TOKEN_KEY)) {
      refreshUserToken().then(() => getUserDetails());
    } else {
      setLoading(false);
    }
  }, []);

  const getUserDetails = async () => {
    try {
      const userDetails = await getLoggedInUser();
      setUserDetails({ ...userDetails, userFound: true });
    } catch (_) {
      setUserDetails((prev) => ({ ...prev, userFound: false }));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <>Loading...</>;
  return (
    <Routes>
      {!userFound && (
        <>
          <Route path="/login" element={<Authentication type="login" />} />
          <Route path="/signup" element={<Authentication type="signup" />} />
        </>
      )}

      <Route
        element={userFound ? <HomeLayout /> : <Navigate to="/login" replace />}
      >
        <Route path="/create" element={<CreatePost />} />
        <Route path="/shared/:post_url" element={<SharedPost />} />
        <Route path="/" element={<PostListing />} />
      </Route>

      <Route
        path="/*"
        element={<Navigate to={userFound ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
