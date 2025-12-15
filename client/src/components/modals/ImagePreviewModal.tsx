import React from "react";
import { XIcon } from "../icons";

interface Props {
    isOpen: boolean;
    imageUrl: string | null;
    onClose: () => void;
}

const ImagePreviewModal = ({ isOpen, imageUrl, onClose }: Props) => {
    if (!isOpen || !imageUrl) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
                <XIcon className="w-8 h-8" />
            </button>
            <img
                src={imageUrl}
                alt="Enlarged view"
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 object-contain"
                onClick={(e) => e.stopPropagation()}
                style={{ transform: "scaleX(-1)" }}
            />
        </div>
    );
};

export default ImagePreviewModal;

