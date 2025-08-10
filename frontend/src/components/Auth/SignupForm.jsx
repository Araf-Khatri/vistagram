import {
  Button,
  ErrorMessage,
  FieldGroup,
  FormContainer,
  Input,
  Label,
} from "@/common/formStyles";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginHandler } from "./handlers";

export default function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      setLoading(true);

      if (
        event.target.password.value !== event.target["confirm-password"].value
      ) {
        setErrorMessage("Passwords do not match");
        setTimeout(() => setErrorMessage(null), 5000);
        setLoading(false);
        return;
      }

      const credentials = {
        username: event.target.username.value,
        password: event.target.password.value,
      };

      await loginHandler(credentials);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Signup failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FieldGroup>
        <Label htmlFor="username">Username</Label>
        <Input placeholder="Username" name="username" type="text" required />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="password">Password</Label>
        <Input
          placeholder="Password"
          name="password"
          type="password"
          required
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          placeholder="Confirm Password"
          name="confirm-password"
          type="password"
          required
        />
      </FieldGroup>

      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

      <Button disabled={loading} type="submit">
        {loading ? "Signing up..." : "Signup"}
      </Button>
    </FormContainer>
  );
}
