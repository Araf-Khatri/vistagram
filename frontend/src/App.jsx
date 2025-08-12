import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Authentication from "./components/Auth";
import CreatePost from "./components/Posts/CreatePost";
import PostListing from "./components/Posts/PostListing";
import SharedPost from "./components/Posts/SharedPost";
import HomeLayout from "./layout/HomeLayout";
import { API_TOKEN_KEY } from "./utils/axiosInstance";

function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem(API_TOKEN_KEY));

  useEffect(() => {
    setToken(localStorage.getItem(API_TOKEN_KEY));
  }, [navigate]);

  return (
    <Routes>
      {!token && (
        <>
          <Route path="/login" element={<Authentication type="login" />} />
          <Route path="/signup" element={<Authentication type="signup" />} />
        </>
      )}

      <Route
        element={token ? <HomeLayout /> : <Navigate to="/login" replace />}
      >
        <Route path="/create" element={<CreatePost />} />
        <Route path="/shared/:post_url" element={<SharedPost />} />
        <Route path="/" element={<PostListing />} />
      </Route>

      <Route
        path="/*"
        element={<Navigate to={token ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
