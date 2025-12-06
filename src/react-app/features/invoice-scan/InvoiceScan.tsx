// Invoice Scan Component
// DEPENDENCY: react-qr-scanner

import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import { X } from 'lucide-react';

interface InvoiceScanProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
}

export const InvoiceScan: React.FC<InvoiceScanProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [firstScan, setFirstScan] = useState<string | null>(null);

  const handleScan = (data: any) => {
    if (data) {
      const scannedText = data.text;
      if (scannedText.startsWith('**')) {
        // This is the second QR code
        if (firstScan) {
          onScanSuccess(firstScan + scannedText);
          onClose();
        } else {
          setError('請先掃描左邊的 QR code');
        }
      } else {
        // This is the first QR code
        setFirstScan(scannedText);
        setError('已掃描左邊的 QR code，請掃描右邊的 QR code');
      }
    }
  };

  const handleError = (err: any) => {
    setError(err.message || '無法讀取QR code');
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
            <QrScanner
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%' }}
            />
          </div>

          {error && <p className="text-center text-blue-500 text-sm mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
};
