import React, { useEffect, useState } from "react";
import { AttendanceRecord } from "../types";
import { clearRecords, getRecords, getSheetUrl, saveSheetUrl } from "../utils/storage";
import {
    CameraIcon,
    RefreshIcon,
    SearchIcon,
    SettingsIcon,
} from "./icons";
import ImagePreviewModal from "./modals/ImagePreviewModal";
import SettingsModal from "./modals/SettingsModal";

interface Props {
    onBack: () => void;
}

const AdminPanel = ({ onBack }: Props) => {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sheetUrl, setSheetUrl] = useState(getSheetUrl());
    const [showSettings, setShowSettings] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMsg, setSyncMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        setRecords(getRecords());
    }, []);

    const handleClear = () => {
        if (window.confirm("Are you sure you want to delete all records?")) {
            clearRecords();
            setRecords([]);
        }
    };

    const handleSync = async () => {
        if (!sheetUrl) {
            setShowSettings(true);
            return;
        }
        if (records.length === 0) {
            setSyncMsg({ type: "error", text: "No records to sync." });
            setTimeout(() => setSyncMsg(null), 3000);
            return;
        }

        setIsSyncing(true);
        setSyncMsg(null);

        try {
            const response = await fetch(sheetUrl, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                },
                body: JSON.stringify({ records: records }),
            });

            if (response.ok) {
                setSyncMsg({ type: "success", text: "Synced successfully!" });
            } else {
                throw new Error("Network response was not ok.");
            }
        } catch (error) {
            console.error("Sync error", error);
            setSyncMsg({ type: "error", text: "Sync failed. Check URL & permissions." });
        } finally {
            setIsSyncing(false);
            setTimeout(() => setSyncMsg(null), 4000);
        }
    };

    const filteredRecords = records.filter((record) => {
        const term = searchTerm.toLowerCase();
        return record.name.toLowerCase().includes(term) || record.date.includes(term);
    });

    return (
        <div className="min-h-screen bg-gray-50 p-4 font-sans">
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                currentUrl={sheetUrl}
                onSave={(url) => {
                    saveSheetUrl(url);
                    setSheetUrl(url);
                }}
            />

            <ImagePreviewModal
                isOpen={!!selectedImage}
                imageUrl={selectedImage}
                onClose={() => setSelectedImage(null)}
            />

            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex flex-col gap-4 bg-violet-700 text-white p-4 rounded-2xl shadow-lg shadow-violet-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <span className="bg-white/20 p-1.5 rounded-lg">
                                    <CameraIcon className="w-5 h-5" />
                                </span>
                                Admin Dashboard
                            </h1>
                            <p className="text-xs text-violet-200 mt-1">{filteredRecords.length} records found</p>
                        </div>
                        <button
                            onClick={onBack}
                            className="px-4 py-2 bg-white text-violet-700 text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-md"
                        >
                            Back
                        </button>
                    </div>

                    <div className="flex gap-2 justify-end items-center border-t border-white/10 pt-3">
                        {syncMsg && (
                            <span
                                className={`text-xs font-bold px-2 py-1 rounded ${syncMsg.type === "success"
                                        ? "bg-green-400/20 text-green-100"
                                        : "bg-red-400/20 text-red-100"
                                    }`}
                            >
                                {syncMsg.text}
                            </span>
                        )}

                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors border border-violet-500"
                        >
                            <RefreshIcon className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                            {isSyncing ? "Syncing..." : "Sync to Sheet"}
                        </button>

                        <button
                            onClick={() => setShowSettings(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors border border-violet-500"
                        >
                            <SettingsIcon className="w-3.5 h-3.5" />
                            Settings
                        </button>

                        <div className="w-px h-6 bg-white/20 mx-1"></div>

                        <button
                            onClick={handleClear}
                            className="px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-lg transition-colors"
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or date..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 sm:text-sm shadow-sm transition-shadow"
                    />
                </div>

                <div className="space-y-3">
                    {filteredRecords.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200 border-dashed">
                            {records.length === 0 ? "No records found." : "No matching records found."}
                        </div>
                    ) : (
                        filteredRecords.map((record) => (
                            <div
                                key={record.id}
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 hover:shadow-md transition-shadow"
                            >
                                <button
                                    onClick={() => setSelectedImage(record.photoData)}
                                    className="relative group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 rounded-full"
                                    title="Click to enlarge"
                                >
                                    <img
                                        src={record.photoData}
                                        alt={record.name}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-violet-100 group-hover:border-violet-300 transition-colors"
                                        style={{ transform: "scaleX(-1)" }}
                                    />
                                    <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <span className="sr-only">View photo</span>
                                    </div>
                                </button>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{record.name}</h3>
                                    <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                        <span className="bg-violet-50 text-violet-700 px-2 py-0.5 rounded-md font-medium">
                                            {record.date}
                                        </span>
                                        <span className="flex items-center gap-1">{record.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;

