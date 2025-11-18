/**
 * Certificates Section Component
 *
 * Displays user's earned certificates in profile
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCertificateDate } from '@/lib/certificates/certificateUtils';

interface Certificate {
  id: string;
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  completionDate: Date;
  totalXPEarned: number;
  averageScore: number | null;
  totalLessons: number;
  timeSpent: number;
  issuedAt: Date;
}

export default function CertificatesSection() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await fetch('/api/certificates/user');
      const data = await response.json();

      if (data.success) {
        setCertificates(data.data.certificates || []);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Certificates</h3>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Certificates</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-1">No Certificates Yet</p>
          <p className="text-gray-500 text-sm">
            Complete courses to earn certificates!
          </p>
          <Link
            href="/courses"
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-800">Certificates</h3>
        <span className="text-sm text-gray-600">
          {certificates.length} earned
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {certificates.map((cert) => (
          <Link
            key={cert.id}
            href={`/certificates/${cert.id}`}
            className="block group border-2 border-indigo-200 rounded-lg p-4 hover:border-indigo-400 hover:shadow-md transition-all"
          >
            {/* Certificate Icon & Badge */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                  {cert.courseTitle}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatCertificateDate(cert.completionDate)}
                </p>
              </div>
            </div>

            {/* Certificate Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-indigo-50 rounded px-2 py-1">
                <span className="text-gray-600">XP: </span>
                <span className="font-semibold text-gray-900">{cert.totalXPEarned}</span>
              </div>
              {cert.averageScore !== null && (
                <div className="bg-purple-50 rounded px-2 py-1">
                  <span className="text-gray-600">Score: </span>
                  <span className="font-semibold text-gray-900">{cert.averageScore.toFixed(0)}%</span>
                </div>
              )}
            </div>

            {/* Certificate Number */}
            <p className="text-xs text-gray-500 mt-3 font-mono">
              {cert.certificateNumber}
            </p>

            {/* View Link */}
            <div className="mt-3 flex items-center text-indigo-600 group-hover:text-indigo-700 text-sm font-medium">
              <span>View Certificate</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* View All Link if more than 2 */}
      {certificates.length > 2 && (
        <div className="mt-4 text-center">
          <Link
            href={"/profile/certificates" as any}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View All Certificates →
          </Link>
        </div>
      )}
    </div>
  );
}
