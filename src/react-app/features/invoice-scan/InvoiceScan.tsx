/**
 * InvoiceScan.tsx - 發票掃描組件
 *
 * 功能說明：
 * 1. 使用相機掃描發票 QR Code
 * 2. 支援台灣電子發票雙 QR Code 格式
 * 3. 自動合併左右兩個 QR Code 資料
 * 4. 顯示掃描狀態和錯誤訊息
 */

import { Scanner } from '@yudiel/react-qr-scanner';
import { X } from 'lucide-react';
import React, { useState } from 'react';

interface InvoiceScanProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
}

export const InvoiceScan: React.FC<InvoiceScanProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [firstScan, setFirstScan] = useState<string | null>(null);

  const handleScan = (results: any) => {
    if (!results) return;

    const firstResult = Array.isArray(results) ? results[0] : results;
    const scannedText = typeof firstResult === 'string' ? firstResult : firstResult?.rawValue;
    if (!scannedText) return;

    if (scannedText.startsWith('**')) {
      // second QR code
      if (firstScan) {
        onScanSuccess(firstScan + scannedText);
        onClose();
      } else {
        setError('請先掃描左邊的 QR code');
      }
    } else {
      // first QR code
      setFirstScan(scannedText);
      setError('已掃描左邊的 QR code，請掃描右邊的 QR code');
    }
  };

  const handleError = (err: unknown) => {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('無法讀取QR code');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-md m-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">掃描電子發票</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <Scanner
              onScan={handleScan}
              onError={handleError}
              constraints={{ facingMode: { ideal: 'environment' } }}
              scanDelay={400}
            />
          </div>

          {error && <p className="text-center text-blue-500 text-sm mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
};
