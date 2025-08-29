import styled from "styled-components";
import { Button } from "./styles";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const Popup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.1);
  max-width: 28.5rem;
  padding: 1.5rem;
  margin: 0 1rem;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: bold;
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: #555;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  margin-top: 1rem;
`;

const PopupButton = styled(Button)`
  width: fit-content;
  padding: 0.8rem 1rem;
  font-size: 0.85rem;
  border: none;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  cursor: pointer;

  &.cancel {
    background: #f2f2f2;
    color: #333;
  }

  &.confirm {
    background: #008080;
    color: white;

    &:hover {
      background: #005d5dff;
    }
  }

  &:disabled {
    background: #999 !important;
    cursor: not-allowed;
  }
`;

const ConfirmationPopup = ({
  isOpen,
  title,
  description,
  confirmCtaText = "Confirm",
  cancelCtaText = "Cancel",
  onClose,
  onConfirm,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <Overlay>
      <Popup>
        <Title>{title}</Title>
        <Description>{description}</Description>
        <ButtonGroup>
          <PopupButton disabled={loading} className="cancel" onClick={onClose}>
            {cancelCtaText}
          </PopupButton>
          <PopupButton
            disabled={loading}
            className="confirm"
            onClick={onConfirm}
          >
            {confirmCtaText}
          </PopupButton>
        </ButtonGroup>
      </Popup>
    </Overlay>
  );
};

export default ConfirmationPopup;
