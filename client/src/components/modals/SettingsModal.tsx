import React, { useState } from "react";
import { SettingsIcon, CheckCircleIcon, CopyIcon } from "../icons";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentUrl: string;
    onSave: (url: string) => void;
}

const SettingsModal = ({ isOpen, onClose, currentUrl, onSave }: Props) => {
    const [url, setUrl] = useState(currentUrl);
    const [copied, setCopied] = useState(false);

    const scriptCode = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  var records = data.records;
  
  // Create headers if new sheet
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "Name", "Date", "Time", "Photo URL"]);
  }

  records.forEach(function(r) {
    // Basic check to avoid duplicates (optional)
    // You can remove this loop if you want to push everything
    sheet.appendRow([r.id, r.name, r.date, r.time, "View in App"]); 
  });
  
  return ContentService.createTextOutput(JSON.stringify({result: "success"}))
    .setMimeType(ContentService.MimeType.JSON);
}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(scriptCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <SettingsIcon className="w-6 h-6 text-violet-600" />
                    Sync Settings
                </h3>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Google Script Web App URL</label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-sm"
                    />
                </div>

                <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-3">
                    <h4 className="font-bold text-gray-800 text-sm">How to Connect Google Sheets:</h4>
                    <ol className="text-xs text-gray-600 space-y-2 list-decimal list-inside">
                        <li>Create a new Google Sheet.</li>
                        <li>Go to <b>Extensions &gt; Apps Script</b>.</li>
                        <li>Delete existing code and paste the code below.</li>
                        <li>Click <b>Deploy &gt; New deployment</b>.</li>
                        <li>Select type: <b>Web app</b>.</li>
                        <li>Description: "Sync". Execute as: <b>Me</b>.</li>
                        <li>Who has access: <b>Anyone</b> (Important!).</li>
                        <li>Click Deploy, copy the <b>Web App URL</b>, and paste it above.</li>
                    </ol>

                    <div className="relative mt-2">
                        <textarea
                            readOnly
                            className="w-full h-32 p-3 text-xs font-mono bg-gray-900 text-green-400 rounded-lg resize-none focus:outline-none"
                            value={scriptCode}
                        />
                        <button
                            onClick={handleCopy}
                            className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
                            title="Copy Code"
                        >
                            {copied ? <CheckCircleIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onSave(url); onClose(); }}
                        className="flex-1 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 shadow-lg shadow-violet-200 transition-all"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;

