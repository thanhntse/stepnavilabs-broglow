import { useRef } from "react";
import { Toast } from "primereact/toast";

export interface ToastOptions {
  summary?: string;
  detail?: string;
  life?: number;
}

export const useToast = () => {
  const toast = useRef<Toast>(null);

  const showSuccess = (options: ToastOptions = {}) => {
    const {
      summary = "Thành công",
      detail = "Thao tác thực hiện thành công",
      life = 3000,
    } = options;

    if (toast.current) {
      toast.current.show({
        severity: "success",
        summary,
        detail,
        life,
      });
    }
  };

  const showError = (options: ToastOptions = {}) => {
    const { summary = "Lỗi", detail = "Đã xảy ra lỗi", life = 3000 } = options;

    if (toast.current) {
      toast.current.show({
        severity: "error",
        summary,
        detail,
        life,
      });
    }
  };

  const showInfo = (options: ToastOptions = {}) => {
    const { summary = "Thông tin", detail = "", life = 3000 } = options;

    if (toast.current) {
      toast.current.show({
        severity: "info",
        summary,
        detail,
        life,
      });
    }
  };

  const showWarning = (options: ToastOptions = {}) => {
    const { summary = "Cảnh báo", detail = "", life = 3000 } = options;

    if (toast.current) {
      toast.current.show({
        severity: "warn",
        summary,
        detail,
        life,
      });
    }
  };

  return {
    toast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};
