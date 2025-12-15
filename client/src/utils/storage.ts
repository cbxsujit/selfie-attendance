import { AttendanceRecord } from "../types";

const STORAGE_KEY = "attendance_records";
const SETTINGS_KEY = "admin_settings";

export const getRecords = (): AttendanceRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to parse records", e);
    return [];
  }
};

export const saveRecord = (record: AttendanceRecord) => {
  const records = getRecords();
  const newRecords = [record, ...records];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
};

export const clearRecords = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getSheetUrl = (): string => {
  try {
    const settings = localStorage.getItem(SETTINGS_KEY);
    return settings ? JSON.parse(settings).sheetUrl || "" : "";
  } catch {
    return "";
  }
};

export const saveSheetUrl = (url: string) => {
  const settings = { sheetUrl: url };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const storageKeys = {
  records: STORAGE_KEY,
  settings: SETTINGS_KEY,
};
