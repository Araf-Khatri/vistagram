import { toast } from "react-toastify";

const commonOptions = {
  hideProgressBar: true,
  autoClose: true,
};

export const showSuccessToast = ({ message }) => {
  toast(message, {
    ...commonOptions,
    className: "success_toast",
  });
};

export const showErrorToast = ({ message }) => {
  toast(message, {
    ...commonOptions,
    className: "error_toast",
  });
};
