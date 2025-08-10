import styled from "styled-components";

export const FormContainer = styled.form`
  max-width: 400px;
  margin: 2rem auto;
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

export const Label = styled.label`
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  font-weight: 500;
  width: fit-content;
`;

export const Input = styled.input`
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  outline: none;

  &:focus {
    border-color: teal;
    box-shadow: 0 0 0 2px rgba(0, 128, 128, 0.2);
  }
`;

export const Button = styled.button`
  padding: 0.75rem;
  background: teal;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s ease;

  &:hover {
    background: #006666;
  }

  &:disabled {
    background: #999;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.p`
  color: red;
  font-size: 0.9rem;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
`;
