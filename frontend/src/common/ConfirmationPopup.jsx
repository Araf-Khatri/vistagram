import styled from "styled-components";

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
  background: white;
  border-radius: 8px;
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.1);
  width: 360px;
  padding: 24px;
  text-align: center;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 8px;
`;

const Description = styled.p`
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

const Button = styled.button`
  flex: 1;
  padding: 10px 0;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;

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
`;

const ConfirmationPopup = ({
  isOpen,
  title,
  description,
  confirmCtaText = "Confirm",
  cancelCtaText = "Cancel",
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <Overlay>
      <Popup>
        <Title>{title}</Title>
        <Description>{description}</Description>
        <ButtonGroup>
          <Button className="cancel" onClick={onClose}>
            {cancelCtaText}
          </Button>
          <Button className="confirm" onClick={onConfirm}>
            {confirmCtaText}
          </Button>
        </ButtonGroup>
      </Popup>
    </Overlay>
  );
};

export default ConfirmationPopup;
