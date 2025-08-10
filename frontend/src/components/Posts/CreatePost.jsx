import { FieldGroup, FormContainer, Input, Label } from "@/common/formStyles";

const CreatePost = () => {
  return (
    <FormContainer>
      <FieldGroup>
        <Label htmlFor="Upload file"></Label>
        <Input type="file" required />
      </FieldGroup>
    </FormContainer>
  );
};

export default CreatePost;
