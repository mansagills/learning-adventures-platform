/**
 * Certificate View Component
 *
 * Displays a printable certificate for course completion
 */

'use client';

import { formatCertificateDate, formatTimeSpent, getAchievementLevel } from '@/lib/certificates/certificateUtils';

interface CertificateViewProps {
  certificate: {
    certificateNumber: string;
    verificationCode: string;
    studentName: string;
    courseTitle: string;
    completionDate: Date;
    totalXPEarned: number;
    averageScore: number | null;
    totalLessons: number;
    timeSpent: number;
    issuedAt: Date;
  };
}

export default function CertificateView({ certificate }: CertificateViewProps) {
  const achievementLevel = getAchievementLevel(certificate.averageScore);

  return (
    <div className="certificate-container max-w-4xl mx-auto bg-white">
      {/* Certificate Border and Content */}
      <div className="certificate-border p-12 border-8 border-double border-indigo-600 shadow-2xl">
        {/* Header Decoration */}
        <div className="text-center mb-8">
          <div className="inline-block">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
              Certificate of {achievementLevel}
            </h1>
            <div className="h-1 w-48 mx-auto bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-700 mb-6">
            This is to certify that
          </p>
          <h2 className="text-5xl font-serif font-bold text-indigo-900 mb-6 border-b-2 border-indigo-300 inline-block px-12 pb-2">
            {certificate.studentName}
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            has successfully completed the course
          </p>
          <h3 className="text-3xl font-semibold text-gray-900 mb-8">
            {certificate.courseTitle}
          </h3>
        </div>

        {/* Achievement Details */}
        <div className="grid grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">Completion Date</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCertificateDate(certificate.completionDate)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">Total XP Earned</div>
            <div className="text-lg font-semibold text-gray-900">
              {certificate.totalXPEarned.toLocaleString()} XP
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">Lessons Completed</div>
            <div className="text-lg font-semibold text-gray-900">
              {certificate.totalLessons} Lessons
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600 mb-1">Time Invested</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatTimeSpent(certificate.timeSpent)}
            </div>
          </div>
        </div>

        {certificate.averageScore !== null && (
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full">
              <span className="text-sm font-medium">Average Score: </span>
              <span className="text-xl font-bold">{certificate.averageScore.toFixed(1)}%</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-8 mt-8">
          <div className="grid grid-cols-2 gap-8">
            {/* Signature Line */}
            <div className="text-center">
              <div className="border-t-2 border-gray-400 w-48 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 font-semibold">Platform Director</p>
              <p className="text-xs text-gray-500">Learning Adventures</p>
            </div>
            {/* Issue Date */}
            <div className="text-center">
              <div className="border-t-2 border-gray-400 w-48 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 font-semibold">Date Issued</p>
              <p className="text-xs text-gray-500">
                {formatCertificateDate(certificate.issuedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Certificate Metadata */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Certificate Number: {certificate.certificateNumber}</p>
          <p className="mt-1">Verification Code: {certificate.verificationCode}</p>
          <p className="mt-2 italic">
            Verify this certificate at learningadventures.com/verify
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .certificate-container {
            max-width: 100%;
            margin: 0;
            padding: 0;
          }
          .certificate-border {
            box-shadow: none;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
