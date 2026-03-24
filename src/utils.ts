import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parses a Google Drive share link to return an embeddable URL.
 * Supports both video and image links.
 */
export function getGoogleDriveEmbedUrl(url: string): string | null {
  if (!url) return null;

  // Pattern for file ID
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (!fileIdMatch) return null;

  const fileId = fileIdMatch[1];

  // For video/image viewing, we use the preview URL
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Formats a Firestore timestamp to a readable date string.
 */
export function formatDate(timestamp: any): string {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
