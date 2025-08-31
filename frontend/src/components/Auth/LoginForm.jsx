import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  FieldGroup,
  FormContainer,
  Input,
  Label,
} from "../../common/styles";
import { showErrorToast, showSuccessToast } from "../../common/toast";
import { loginHandler } from "./handlers";

export default function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      setLoading(true);

      const credentials = {
        username: event.target.username.value,
        password: event.target.password.value,
      };

      await loginHandler(credentials);
      const redirectUrl = searchParams.get("redirect") || "/";

      showSuccessToast({ message: "You’re now logged in." });
      setTimeout(() => navigate(redirectUrl, { replace: true }), 1000);
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
        <Label htmlFor="username">Username:*</Label>
        <Input placeholder="Username" name="username" type="text" required />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="password">Password:*</Label>
        <Input
          placeholder="Password"
          name="password"
          type="password"
          required
        />
      </FieldGroup>

      <Button disabled={loading} type="submit">
        {loading ? "Logging in..." : "Login"}
      </Button>
    </FormContainer>
  );
}
