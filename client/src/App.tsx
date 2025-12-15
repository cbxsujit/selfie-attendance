import React, { useCallback, useEffect, useRef, useState } from "react";
import AdminPanel from "./components/AdminPanel";
import SuccessTick from "./components/SuccessTick";
import { AlertCircleIcon, CameraIcon } from "./components/icons";
import { saveRecord } from "./utils/storage";
import { AttendanceRecord } from "./types";

const App = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [name, setName] = useState("");
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const startCamera = useCallback(async () => {
        setIsInitializing(true);
        setCameraError(null);
        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "user",
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                },
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch((e) => console.log("Play error:", e));
            }
        } catch (err: any) {
            console.error("Camera Error:", err);
            let msg = "Could not access camera.";
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                msg = "Permission denied. Check address bar permissions.";
            } else if (err.name === "NotFoundError") {
                msg = "No camera found.";
            }
            setCameraError(msg);
        } finally {
            setIsInitializing(false);
        }
    }, []);

    useEffect(() => {
        if (!isAdmin && !capturedImage) {
            startCamera();
        }
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, [isAdmin, capturedImage, startCamera]);

    const handleCapture = () => {
        if (!name.trim()) {
            alert("Please enter your name first!");
            return;
        }

        if (videoRef.current) {
            const canvas = document.createElement("canvas");
            const captureWidth = 300;
            const scale = captureWidth / videoRef.current.videoWidth;
            canvas.width = captureWidth;
            canvas.height = videoRef.current.videoHeight * scale;

            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const photoData = canvas.toDataURL("image/jpeg", 0.85);

                const now = new Date();
                const record: AttendanceRecord = {
                    id: now.getTime().toString(),
                    name: name.trim(),
                    date: now.toLocaleDateString(),
                    time: now.toLocaleTimeString(),
                    photoData: photoData,
                };

                saveRecord(record);
                setCapturedImage(photoData);
                setIsSuccess(true);

                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((track) => track.stop());
                }
            }
        }
    };

    const openAdminLogin = () => {
        setShowLoginModal(true);
        setLoginPassword("");
        setLoginError("");
    };

    const handleLoginSubmit = () => {
        if (loginPassword === "1234") {
            setIsAdmin(true);
            setShowLoginModal(false);
        } else {
            setLoginError("Incorrect password");
        }
    };

    const reset = () => {
        setCapturedImage(null);
        setName("");
        setIsSuccess(false);
        setCameraError(null);
    };

    if (isAdmin) {
        return <AdminPanel onBack={() => setIsAdmin(false)} />;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4 font-sans relative">
            {showLoginModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Admin Access</h3>
                            <p className="text-sm text-gray-500">Enter password to continue</p>
                        </div>

                        <div className="space-y-2">
                            <input
                                type="password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                autoFocus
                                onKeyDown={(e) => e.key === "Enter" && handleLoginSubmit()}
                            />
                            {loginError && <p className="text-red-500 text-sm font-medium ml-1">{loginError}</p>}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="flex-1 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLoginSubmit}
                                className="flex-1 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 shadow-lg shadow-violet-200 transition-all"
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-violet-700 flex items-center justify-center gap-2">
                    <CameraIcon className="w-8 h-8" />
                    Smart Haaziri
                </h1>
                <p className="text-gray-500 font-medium mt-1">Sachhi Attendance, Photo Ke Saath</p>
            </div>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-violet-200 overflow-hidden relative border border-gray-100">
                <div className="p-1.5">
                    <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center group">
                        {isSuccess && <SuccessTick />}

                        {!capturedImage ? (
                            <>
                                {isInitializing && (
                                    <div className="absolute inset-0 flex items-center justify-center text-white/50 z-10">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                    </div>
                                )}

                                {cameraError ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-gray-800">
                                        <AlertCircleIcon className="w-10 h-10 text-red-400 mb-2" />
                                        <p className="mb-4 text-sm text-gray-300">{cameraError}</p>
                                        <button
                                            onClick={startCamera}
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover mirror-mode"
                                        style={{ transform: "scaleX(-1)" }}
                                    />
                                )}
                            </>
                        ) : (
                            <img
                                src={capturedImage}
                                alt="Captured"
                                className="w-full h-full object-cover"
                                style={{ transform: "scaleX(-1)" }}
                            />
                        )}
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {!capturedImage ? (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                                    Employee Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
                                />
                            </div>

                            <button
                                onClick={handleCapture}
                                disabled={!!cameraError || isInitializing}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-lg shadow-lg shadow-violet-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                            >
                                Capture & Mark Present
                            </button>
                        </>
                    ) : (
                        <div className="text-center space-y-4 pt-2">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-gray-900">Attendance Marked!</h3>
                                <p className="text-gray-500">Have a great day, {name}.</p>
                            </div>
                            <button
                                onClick={reset}
                                className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Mark Another
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <button
                    onClick={openAdminLogin}
                    className="text-xs font-medium text-gray-400 hover:text-violet-600 transition-colors px-4 py-2"
                >
                    Admin Login
                </button>
            </div>
        </div>
    );
};

export default App;

