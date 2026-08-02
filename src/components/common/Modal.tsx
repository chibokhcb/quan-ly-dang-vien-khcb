import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-xl shadow-2xl border border-gray-200 w-full ${maxWidth} overflow-hidden transform transition-all`}
      >
        <div className="bg-red-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-red-800">
          <h3 className="font-bold text-sm tracking-wide text-white uppercase">{title}</h3>
          <button
            onClick={onClose}
            className="text-red-200 hover:text-white p-1 rounded-lg hover:bg-red-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto text-gray-800 text-xs leading-relaxed">{children}</div>
      </div>
    </div>
  );
};
