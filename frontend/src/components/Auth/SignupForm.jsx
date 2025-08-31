import {
  Button,
  FieldGroup,
  FormContainer,
  Input,
  Label,
} from "@/common/styles";
import { showErrorToast, showSuccessToast } from "@/common/toast";
import UserContext from "@/context/userContext";
import { useContext, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signupHandler } from "./handlers";

export default function SignupForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUserDetails } = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      setLoading(true);

      if (
        event.target.password.value !== event.target["confirm-password"].value
      ) {
        showErrorToast({ message: "Passwords do not match" });
        setLoading(false);
        return;
      }

      const credentials = {
        username: event.target.username.value,
        password: event.target.password.value,
      };

      const userDetails = await signupHandler(credentials);
      const redirectUrl = searchParams.get("redirect") || "/";

      setUserDetails({ ...userDetails, userFound: true });
      setTimeout(() => navigate(redirectUrl, { replace: true }), 1000);
      showSuccessToast({ message: "Welcome! You’ve successfully signed in." });
    } catch (err) {
      const errMessage = err?.response?.data?.message;
      showErrorToast({
        message: errMessage,
      });
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

      <Button disabled={loading} type="submit">
        {loading ? "Signing up..." : "Signup"}
      </Button>
    </FormContainer>
  );
}
