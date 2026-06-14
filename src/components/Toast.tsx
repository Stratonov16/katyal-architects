"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string;
  type: "success" | "error";
  onClose: () => void;
};

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-5 py-3 rounded-lg shadow-lg text-xs animate-slide-up ${
      type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
    }`}>
      {message}
    </div>
  );
}
