import {
  Button,
  FieldGroup,
  FormContainer,
  Input,
  Label,
} from "@/common/styles";
import UserContext from "@/context/userContext";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginHandler } from "./handlers";

export default function LoginForm() {
  const navigate = useNavigate();
  const { setUserDetails } = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      setLoading(true);

      const credentials = {
        username: event.target.username.value,
        password: event.target.password.value,
      };

      const userDetails = await loginHandler(credentials);
      setUserDetails({ ...userDetails, userFound: true });
      setTimeout(() => navigate("/", { replace: true }), 500);
    } catch (err) {
      console.error("Login failed:", err);
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
