/* editorial-ui · Cristian Pérez · cristianperez.me */
import React from "react";
import { CloseIcon } from "./icons/Icons";

export type ToastState =
  | { readonly show: false }
  | {
      readonly show: true;
      readonly text: string;
      readonly action?: { readonly label: string; readonly onClick: () => void };
    };

interface ToastProps {
  readonly toast: ToastState;
  readonly onClose: () => void;
  readonly closeLabel: string;
}

export const Toast = ({ toast, onClose, closeLabel }: ToastProps) => (
  <div className="iu-toast-region" role="status" aria-live="polite">
    {toast.show && (
      <div className="iu-toast" key={toast.text}>
        <p>{toast.text}</p>
        {toast.action && (
          <button
            type="button"
            className="iu-toast__action"
            onClick={() => {
              toast.action?.onClick();
              onClose();
            }}
          >
            {toast.action.label}
          </button>
        )}
        <button type="button" className="iu-toast__close" onClick={onClose} aria-label={closeLabel}>
          <CloseIcon size={18} />
        </button>
      </div>
    )}
  </div>
);
