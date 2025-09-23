'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  XMarkIcon, 
  ClipboardDocumentIcon,
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: number;
  tableName: string;
}

export default function QRModal({ isOpen, onClose, tableId, tableName }: QRModalProps) {
  const [copied, setCopied] = useState(false);
  
  const qrCodeUrl = `${window.location.origin}/table?table=${tableId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById(`qr-${tableId}`);
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `table-${tableId}-qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            QR Code for {tableName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="text-center">
          <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-gray-100 inline-block">
            <QRCodeSVG
              id={`qr-${tableId}`}
              value={qrCodeUrl}
              size={200}
              level="M"
              includeMargin={true}
            />
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs text-gray-500 mb-1">Table URL:</p>
              <p className="text-sm font-mono text-gray-900 break-all">
                {qrCodeUrl}
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center justify-center space-x-2"
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
                <span>{copied ? 'Copied!' : 'Copy URL'}</span>
              </button>
              
              <button
                onClick={downloadQR}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center justify-center space-x-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Download QR</span>
              </button>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p>Customers can scan this QR code to access the menu and place orders for this table.</p>
          </div>
        </div>
      </div>
    </div>
  );
}