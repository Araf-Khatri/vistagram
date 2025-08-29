"use client";
import {
  Button,
  ErrorMessage,
  FieldGroup,
  FormContainer,
  Input,
  Label,
} from "@/common/styles";
import { showErrorToast, showSuccessToast } from "@/common/toast";
import uploadImage from "@/utils/uploadImage";
import { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { createPost } from "../handlers";

const CreatePostForm = styled(FormContainer)`
  max-width: 500px;
  margin: 3rem auto;
`;

const Flex = styled.div`
  display: flex;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
`;

const FileUploaded = styled(Flex)`
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 0 0 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
`;

const Square = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border-left: 1px solid #ccc;
`;

const CreatePost = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [showErrorMessage, setShowErrorMessage] = useState(null);

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      const caption = e.target.caption.value.replace(/ +/g, " ").trim();
      if (caption.length == 0) {
        showErrorToast("Caption is required");
      }
      const imageUrl = await uploadImage(file);
      await createPost({
        image: imageUrl,
        caption: e.target.caption.value,
      });
      showSuccessToast({ message: "Post published!" });
      navigate("/", { replace: true });
    } catch (err) {
      const errMessage =
        err?.response?.data?.message ||
        `Error status code: ${err?.response?.status}`;
      showErrorToast(errMessage);
      setTimeout(() => setShowErrorMessage(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CreatePostForm onSubmit={onSubmitHandler}>
      <Title>Create Post</Title>
      {showErrorMessage && <ErrorMessage>{showErrorMessage}</ErrorMessage>}
      <FieldGroup>
        <Label htmlFor="file">Upload File:*</Label>
        <Flex>
          {!file ? (
            <Input
              id="file"
              type="file"
              onChange={(e) => {
                const inputFile = e.target.files[0];

                if (inputFile) setFile(inputFile);
                else setFile(null);
              }}
              accept="image/*"
              required
            />
          ) : (
            <FileUploaded>
              <p>Uploaded File: {file?.name}</p>
              <Square onClick={() => setFile(null)}>
                <RxCross2 />
              </Square>
            </FileUploaded>
          )}
        </Flex>
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="caption">Caption:*</Label>
        <Input name="caption" type="text" required />
      </FieldGroup>
      <Button disabled={loading} type="submit">
        {loading ? "Uploading..." : "Create Post"}
      </Button>
    </CreatePostForm>
  );
};

export default CreatePost;
