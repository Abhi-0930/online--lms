import React, { createContext, useContext, useState, useCallback } from "react";
import CustomConfirmDialog, { CustomConfirmDialogProps } from "@/components/CustomConfirmDialog";
import CustomAlertDialog, { CustomAlertDialogProps } from "@/components/CustomAlertDialog";

interface ConfirmOptions {
  title?: string;
  description?: React.ReactNode | string;
  targetName?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "warning" | "info" | "primary";
  icon?: React.ComponentType<{ className?: string }>;
}

interface AlertOptions {
  title?: string;
  message: React.ReactNode | string;
  buttonText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  icon?: React.ComponentType<{ className?: string }>;
}

interface ConfirmAlertContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions | string) => Promise<void>;
}

const ConfirmAlertContext = createContext<ConfirmAlertContextValue | null>(null);

export function ConfirmAlertProvider({ children }: { children: React.ReactNode }) {
  // Confirm State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve?: (value: boolean) => void;
  }>({
    isOpen: false,
    options: {},
  });

  // Alert State
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    options: AlertOptions;
    resolve?: () => void;
  }>({
    isOpen: false,
    options: { message: "" },
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const alert = useCallback((optionsOrMessage: AlertOptions | string): Promise<void> => {
    const options: AlertOptions =
      typeof optionsOrMessage === "string"
        ? { message: optionsOrMessage }
        : optionsOrMessage;

    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirmClose = () => {
    if (confirmState.resolve) {
      confirmState.resolve(false);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirmConfirm = () => {
    if (confirmState.resolve) {
      confirmState.resolve(true);
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleAlertClose = () => {
    if (alertState.resolve) {
      alertState.resolve();
    }
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmAlertContext.Provider value={{ confirm, alert }}>
      {children}

      {/* Global Confirm Modal */}
      <CustomConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={handleConfirmClose}
        onConfirm={handleConfirmConfirm}
        title={confirmState.options.title || "Confirm Action"}
        description={confirmState.options.description || "Are you sure you want to proceed?"}
        targetName={confirmState.options.targetName}
        confirmText={confirmState.options.confirmText || "Confirm"}
        cancelText={confirmState.options.cancelText || "Cancel"}
        variant={confirmState.options.variant || "destructive"}
        icon={confirmState.options.icon}
      />

      {/* Global Alert Modal */}
      <CustomAlertDialog
        isOpen={alertState.isOpen}
        onClose={handleAlertClose}
        title={alertState.options.title || "Notice"}
        message={alertState.options.message}
        buttonText={alertState.options.buttonText || "Got it"}
        variant={alertState.options.variant || "info"}
        icon={alertState.options.icon}
      />
    </ConfirmAlertContext.Provider>
  );
}

export function useConfirmAlert() {
  const context = useContext(ConfirmAlertContext);
  if (!context) {
    throw new Error("useConfirmAlert must be used within a ConfirmAlertProvider");
  }
  return context;
}
