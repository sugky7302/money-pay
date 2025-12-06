// Invoice scanning modal using camera or image upload

import { Scanner } from '@yudiel/react-qr-scanner';
import React from 'react';
import { ParsedInvoice, parseInvoicePayload } from '../lib/parseInvoice';

interface InvoiceScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParsed: (data: ParsedInvoice) => void;
}

export const InvoiceScanModal: React.FC<InvoiceScanModalProps> = ({ isOpen, onClose, onParsed }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white w-full md:w-[420px] md:rounded-2xl rounded-t-3xl p-5 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 md:hidden" />
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">掃描電子發票</h3>
          <button onClick={onClose} className="text-gray-500 text-sm">關閉</button>
        </div>

        <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
          <Scanner
            onScan={(results: any) => {
              const first = Array.isArray(results) ? results[0] : results;
              const text = typeof first === 'string' ? first : first?.rawValue;
              if (!text) return;
              const parsed = parseInvoicePayload(text);
              onParsed(parsed);
              onClose();
            }}
            onError={(err) => console.error(err)}
            constraints={{ facingMode: { ideal: 'environment' } }}
            scanDelay={400}
          />
        </div>

        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          若無法開啟相機，可點擊影像區選擇照片或截圖進行辨識。掃描成功後會自動帶入金額、日期與備註。
        </p>
      </div>
    </div>
  );
};
