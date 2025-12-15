import React from "react";
import { CheckCircleIcon } from "./icons";

const SuccessTick = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10 animate-in fade-in duration-300">
        <div className="bg-white rounded-full p-4 shadow-2xl animate-in zoom-in-50 duration-300">
            <CheckCircleIcon className="w-16 h-16 text-green-500" />
        </div>
    </div>
);

export default SuccessTick;

