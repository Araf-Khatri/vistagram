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
  const [token, setToken] = useState(null);

  useEffect(() => {
    const tokenExists = localStorage.getItem(API_TOKEN_KEY) || null;
    setToken(tokenExists);
    // if (!tokenExists) {
    //   navigate("/login", { replace: true });
    // }
  }, [navigate]);

  return (
    <>
      {/* <Route path="/posts" element={<Auth />} /> */}
      {!token ? (
        <>
          <Routes>
            <Route path="/login" element={<Authentication type="login" />} />
            <Route path="/signup" element={<Authentication type="signup" />} />
            <Route path="*" element={<Navigate to={"/login"} />}></Route>
          </Routes>
        </>
      ) : (
        <HomeLayout>
          <Routes>
            <Route path="/shared/:post_url" element={<SharedPost />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/" element={<PostListing />} />
            <Route path="*" element={<Navigate to={"/"} />}></Route>
          </Routes>
        </HomeLayout>
      )}
    </>
  );
}

export default App;
