import { Link } from "react-router-dom";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const Authentication = ({ type }) => {
  return (
    <Flex
      flexDirection="column"
      width="100wh"
      height="100vh"
      backgroundColor="white"
      color={"black"}
      justifyContent="center"
      alignItems="center"
      padding={"1rem"}
    >
      <Stack>
        <Heading color="teal.900">Welcome</Heading>
        <Box minW={{ base: "100%", md: "700px" }}>
          {type === "login" && <LoginForm />}
          {type === "signup" && <SignupForm />}
        </Box>
      </Stack>
      {type === "login" && (
        <Box color={"black"}>
          New to us?{" "}
          <Link color="teal.900" to="/signup">
            Sign Up
          </Link>
        </Box>
      )}
      {type === "signup" && (
        <Box color={"black"}>
          Already have an account?{" "}
          <Link color="teal.900" to="/login">
            Login
          </Link>
        </Box>
      )}
    </Flex>
  );
};

export default Authentication;
