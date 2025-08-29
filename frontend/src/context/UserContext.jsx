import { createContext } from "react";

const UserContext = createContext({
  userDetails: {
    id: null,
    username: null,
    userFound: false,
  },
  setUserDetails: () => true,
});

export default UserContext;
