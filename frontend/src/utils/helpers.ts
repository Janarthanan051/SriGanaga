import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// Date utilities
export const formatDate = (date: string | Date, format = 'DD/MM/YYYY'): string => {
  return dayjs(date).format(format);
};

export const getCurrentDate = (format = 'YYYY-MM-DD'): string => {
  return dayjs().format(format);
};

export const getCurrentMonth = (): string => {
  return dayjs().format('YYYY-MM');
};

export const addDays = (date: string | Date, days: number): string => {
  return dayjs(date).add(days, 'day').format('YYYY-MM-DD');
};

// Currency utilities
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^\d.-]/g, ''));
};

// ID generation
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const re = /^[0-9]{10}$/;
  return re.test(phone.replace(/[^\d]/g, ''));
};

export const isValidPAN = (pan: string): boolean => {
  const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return re.test(pan.toUpperCase());
};

export const isValidGST = (gst: string): boolean => {
  const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[Z]{1}[0-9]{1}$/;
  return re.test(gst.toUpperCase());
};

// Storage utilities
export const setLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting local storage:', error);
  }
};

export const getLocalStorage = (key: string): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error getting local storage:', error);
    return null;
  }
};

export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing local storage:', error);
  }
};

// Report utilities
export const generatePDF = (title: string, content: string): void => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 10, 10);
  doc.setFontSize(12);
  doc.text(content, 10, 30);
  doc.save(`${title}-${getCurrentDate()}.pdf`);
};

export const generateExcel = (filename: string, data: any[], sheetName = 'Sheet1'): void => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}-${getCurrentDate()}.xlsx`);
};

// Statistics utilities
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
};

// Error handling
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error?.message) return error.message;
  if (error?.error?.message) return error.error.message;
  return 'An unknown error occurred';
};

// Array utilities
export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set<any>();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce(
    (result, item) => {
      const group = String(item[key]);
      if (!result[group]) result[group] = [];
      result[group].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
};

// Sorting utilities
export const sortByDate = (a: any, b: any, key: string, ascending = true): number => {
  const dateA = dayjs(a[key]);
  const dateB = dayjs(b[key]);
  return ascending ? dateA.diff(dateB) : dateB.diff(dateA);
};

export const sortByNumber = (a: any, b: any, key: string, ascending = true): number => {
  return ascending ? a[key] - b[key] : b[key] - a[key];
};
