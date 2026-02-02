'use client';

import { useState } from 'react';
import Icon from '../Icon';
import { Adventure } from '@/lib/catalogData';

interface SocialShareProps {
  adventure: Adventure;
  compact?: boolean;
}

export default function SocialShare({
  adventure,
  compact = false,
}: SocialShareProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/catalog?adventure=${adventure.id}`
      : '';

  const shareText = `Check out "${adventure.title}" - ${adventure.description}`;

  const handleShare = async (
    platform: 'twitter' | 'facebook' | 'email' | 'copy'
  ) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
          '_blank',
          'width=600,height=400'
        );
        break;

      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          '_blank',
          'width=600,height=400'
        );
        break;

      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(adventure.title)}&body=${encodedText}%0A%0A${encodedUrl}`;
        break;

      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (error) {
          console.error('Failed to copy:', error);
        }
        break;
    }

    // Close menu after action
    setTimeout(() => setShowShareMenu(false), 100);
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowShareMenu(!showShareMenu);
          }}
          className="p-1.5 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-110 bg-white border border-gray-200 shadow-sm"
          aria-label="Share adventure"
          title="Share this adventure"
        >
          <Icon name="share" size={16} className="text-gray-600" />
        </button>

        {showShareMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowShareMenu(false);
              }}
            />

            {/* Share Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleShare('twitter');
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
              >
                <Icon name="twitter" size={18} className="text-blue-400" />
                <span className="text-sm text-gray-700">Twitter</span>
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleShare('facebook');
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
              >
                <Icon name="facebook" size={18} className="text-blue-600" />
                <span className="text-sm text-gray-700">Facebook</span>
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleShare('email');
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
              >
                <Icon name="mail" size={18} className="text-gray-600" />
                <span className="text-sm text-gray-700">Email</span>
              </button>

              <div className="border-t border-gray-200 my-1"></div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleShare('copy');
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
              >
                <Icon
                  name={copied ? 'check' : 'link'}
                  size={18}
                  className={copied ? 'text-green-500' : 'text-gray-600'}
                />
                <span className="text-sm text-gray-700">
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Full size share buttons
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600 font-medium">Share:</span>

      <button
        onClick={() => handleShare('twitter')}
        className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
        aria-label="Share on Twitter"
        title="Share on Twitter"
      >
        <Icon
          name="twitter"
          size={20}
          className="text-blue-400 group-hover:text-blue-600"
        />
      </button>

      <button
        onClick={() => handleShare('facebook')}
        className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
        aria-label="Share on Facebook"
        title="Share on Facebook"
      >
        <Icon
          name="facebook"
          size={20}
          className="text-blue-600 group-hover:text-blue-700"
        />
      </button>

      <button
        onClick={() => handleShare('email')}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
        aria-label="Share via Email"
        title="Share via Email"
      >
        <Icon
          name="mail"
          size={20}
          className="text-gray-600 group-hover:text-gray-800"
        />
      </button>

      <button
        onClick={() => handleShare('copy')}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
        aria-label={copied ? 'Link copied!' : 'Copy link'}
        title={copied ? 'Link copied!' : 'Copy link'}
      >
        <Icon
          name={copied ? 'check' : 'link'}
          size={20}
          className={
            copied
              ? 'text-green-500'
              : 'text-gray-600 group-hover:text-gray-800'
          }
        />
      </button>
    </div>
  );
}
