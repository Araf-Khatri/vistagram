import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Cookies from "universal-cookie";
import Authentication from "./components/Auth";
import Posts from "./components/Posts";
import HomeLayout from "./layout/HomeLayout";
import { API_TOKEN_KEY } from "./utils/constant";

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const token = new Cookies().get(API_TOKEN_KEY);
    setToken(token);
  }, []);

  return (
    <BrowserRouter>
      <HomeLayout>
        <Routes>
          {/* <Route path="/posts" element={<Auth />} /> */}
          {!token ? (
            <>
              <Route path="/login" element={<Authentication type="login" />} />
              <Route
                path="/signup"
                type="signup"
                element={<Authentication type="signup" />}
              />
            </>
          ) : (
            <>
              <Route path="/" element={<Posts />} />
              <Route path="/create" element={<></>} />
            </>
          )}
        </Routes>
      </HomeLayout>
    </BrowserRouter>
  );
}

export default App;
