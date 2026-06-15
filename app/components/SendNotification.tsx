import toast, {
  Toaster,
  ToastOptions as HotToastOptions,
} from "react-hot-toast";
import React from "react";

/**
 * Enhanced Toast Options for more customization
 */
interface ExtendedToastOptions extends HotToastOptions {
  type?: "success" | "error" | "loading" | "default";
  iconTheme?: {
    primary: string;
    secondary: string;
  };
}

/**
 * SendNotification - A perfect notification function with full customization.
 * @param message The message to display
 * @param options Customization options for the toast
 */
export const SendNotification = (
  message: any,
  typeOrOptions?:
    | "success"
    | "error"
    | "loading"
    | "default"
    | ExtendedToastOptions,
) => {
  // Safe-guard message rendering to prevent "Objects are not valid as a React child"
  let messageStr = "";
  if (message instanceof Error) {
    messageStr = message.message;
  } else if (message && typeof message === "object") {
    messageStr = message.message || message.name || JSON.stringify(message);
  } else {
    messageStr = String(message || "");
  }

  // Normalize parameters
  let type: "success" | "error" | "loading" | "default" = "default";
  let options: ExtendedToastOptions = {};

  if (typeof typeOrOptions === "string") {
    type = typeOrOptions;
  } else if (typeOrOptions) {
    options = typeOrOptions;
    type = options.type || "default";
  }

  // Define premium default styles using app theme variables
  const defaultStyle: React.CSSProperties = {
    background: "rgba(17, 17, 34, 0.9)", // var(--color-bg-main) with opacity
    backdropFilter: "blur(12px) saturate(180%)",
    color: "#ffffff",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: 500,
    boxShadow:
      "0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 15px rgba(129, 140, 248, 0.1)",
    maxWidth: "400px",
    ...options.style,
  };

  const toastOptions: ExtendedToastOptions = {
    duration: 4000,
    position: "top-center",
    style: defaultStyle,
    className: `custom-toast-${type} ${options.className || ""}`,
    ...options,
  };

  // Trigger the appropriate toast
  switch (type) {
    case "success":
      return toast.success(messageStr, {
        ...toastOptions,
        iconTheme: options.iconTheme || {
          primary: "#10b981", // Emerald 500
          secondary: "#ffffff",
        },
      });
    case "error":
      return toast.error(messageStr, {
        ...toastOptions,
        iconTheme: options.iconTheme || {
          primary: "#ef4444", // Red 500
          secondary: "#ffffff",
        },
      });
    case "loading":
      return toast.loading(messageStr, toastOptions);
    default:
      return toast(messageStr, toastOptions);
  }
};

/**
 * CustomToaster - A styled Toaster component to be used at the root of the app.
 * Provides consistent premium styling across all notifications.
 */
export const CustomToaster = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options for all toasts
        className: "premium-toast",
        duration: 4000,
        style: {
          background: "rgba(17, 17, 34, 0.95)",
          color: "#fff",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          backdropFilter: "blur(10px)",
        },
        success: {
          iconTheme: {
            primary: "#818cf8", // var(--color-accent-primary)
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#f87171",
            secondary: "#fff",
          },
        },
      }}
    />
  );
};
