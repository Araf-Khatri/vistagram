import { Link } from "react-router-dom";
import styled from "styled-components";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: white;
  color: black;
  justify-content: center;
  align-items: center;
  padding: 1rem;
`;

const InnerStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  width: 100%;
  gap: 1rem;
  @media (max-width: 768px) {
    margin: 0 1rem;
  }
`;

const Heading = styled.h1`
  color: #008080;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const FormWrapper = styled.div`
  min-width: 100%;
`;

const TextBox = styled.div`
  color: black;
  font-size: 0.95rem;

  a {
    color: #008080;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export default function Authentication({ type }) {
  return (
    <Container>
      <InnerStack>
        <Heading>Welcome</Heading>
        <FormWrapper>
          {type === "login" && <LoginForm />}
          {type === "signup" && <SignupForm />}
        </FormWrapper>
      </InnerStack>

      {type === "login" && (
        <TextBox>
          New to us?{" "}
          <Link to="/signup" replace>
            Sign Up
          </Link>
        </TextBox>
      )}

      {type === "signup" && (
        <TextBox>
          Already have an account?{" "}
          <Link to="/login" replace>
            Login
          </Link>
        </TextBox>
      )}
    </Container>
  );
}
