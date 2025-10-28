"use client";

import ReactModal from "react-modal";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={title}
      className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-auto my-16 outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      closeTimeoutMS={200}
    >
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition text-2xl leading-none"
          aria-label="Close modal"
        >
          ×
        </button>
      </div>
      {children}
    </ReactModal>
  );
}

