import React, { useContext, useEffect } from "react";
import { AlertContext } from "../context/AlertProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Alert() {
  const {
    alertState: { show, message, variant },
    dispatchAlert,
  } = useContext(AlertContext);

  const toastType = {
    Success: "success",
    Danger: "error",
    Warning: "warning",
    Info: "info",
  }[variant] || "default";

  const notify = () => toast(message, { type: toastType });

  useEffect(() => {
    if (show) {
      notify();
      const timeout = setTimeout(() => {
        dispatchAlert({ type: "HIDE" });
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [show]);

  return <ToastContainer />;
}

export default Alert;
