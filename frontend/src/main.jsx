import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import App from "./App.jsx";
import UserContextProvider from "./context/userContextProvider.jsx";
import "./main.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <UserContextProvider>
      <App />
    </UserContextProvider>
    <ToastContainer position="top-right" autoClose={3000} />
  </BrowserRouter>
);
