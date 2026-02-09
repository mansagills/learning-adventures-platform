/**
 * Certificate Page
 *
 * Displays a printable certificate with download/print options
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CertificateView from '@/components/certificates/CertificateView';
import LoadingSpinner from '@/components/LoadingSpinner';

interface CertificatePageProps {
  params: {
    certificateId: string;
  };
}

export default function CertificatePage({ params }: CertificatePageProps) {
  const { certificateId } = params;
  const router = useRouter();
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificate();
  }, [certificateId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/certificates/${certificateId}`);
      const data = await response.json();

      if (data.success) {
        setCertificate(data.data.certificate);
      } else {
        setError(data.error?.message || 'Failed to load certificate');
      }
    } catch (err) {
      setError('Failed to load certificate');
      console.error('Error fetching certificate:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Use browser's print to PDF functionality
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">
              {error || 'Certificate not found'}
            </p>
            <button
              onClick={() => router.push('/profile')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Return to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Action Buttons - Hidden when printing */}
        <div className="no-print mb-8 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
          >
            ← Back
          </button>
          <div className="flex gap-4">
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print Certificate
            </button>
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download PDF
            </button>
          </div>
        </div>

        {/* Certificate */}
        <CertificateView certificate={certificate} />

        {/* Instructions - Hidden when printing */}
        <div className="no-print mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            How to Save as PDF
          </h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-1 text-sm">
            <li>Click "Download PDF" or "Print Certificate" button above</li>
            <li>
              In the print dialog, select "Save as PDF" as the destination
            </li>
            <li>Click "Save" and choose where to save your certificate</li>
          </ol>
          <p className="mt-4 text-xs text-blue-700">
            <strong>Tip:</strong> You can share this page URL to allow others to
            verify your certificate.
          </p>
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
