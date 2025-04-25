import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export function BoldIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"></path>
      <path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"></path>
    </svg>
  );
}

export function ItalicIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="19" y1="4" x2="10" y2="4"></line>
      <line x1="14" y1="20" x2="5" y2="20"></line>
      <line x1="15" y1="4" x2="9" y2="20"></line>
    </svg>
  );
}

export function UnderlineIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 3v7a6 6 0 0012 0V3"></path>
      <line x1="4" y1="21" x2="20" y2="21"></line>
    </svg>
  );
}

export function ListBulletIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="9" y1="6" x2="20" y2="6"></line>
      <line x1="9" y1="12" x2="20" y2="12"></line>
      <line x1="9" y1="18" x2="20" y2="18"></line>
      <circle cx="4" cy="6" r="2"></circle>
      <circle cx="4" cy="12" r="2"></circle>
      <circle cx="4" cy="18" r="2"></circle>
    </svg>
  );
}

export function ListNumberedIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="10" y1="6" x2="21" y2="6"></line>
      <line x1="10" y1="12" x2="21" y2="12"></line>
      <line x1="10" y1="18" x2="21" y2="18"></line>
      <path d="M4 6h1v4"></path>
      <path d="M4 10h2"></path>
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
    </svg>
  );
}

export function IndentIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="3" y1="8" x2="21" y2="8"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="16" x2="21" y2="16"></line>
      <line x1="3" y1="16" x2="3" y2="12"></line>
      <line x1="3" y1="12" x2="8" y2="16"></line>
    </svg>
  );
}

export function OutdentIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="3" y1="8" x2="21" y2="8"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="16" x2="21" y2="16"></line>
      <line x1="3" y1="12" x2="3" y2="16"></line>
      <line x1="3" y1="16" x2="8" y2="12"></line>
    </svg>
  );
}

export function AlignLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="12" x2="15" y2="12"></line>
      <line x1="3" y1="18" x2="18" y2="18"></line>
    </svg>
  );
}

export function AlignCenterIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="6" y1="12" x2="18" y2="12"></line>
      <line x1="4" y1="18" x2="20" y2="18"></line>
    </svg>
  );
}

export function AlignRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="9" y1="12" x2="21" y2="12"></line>
      <line x1="6" y1="18" x2="21" y2="18"></line>
    </svg>
  );
}

export function AlignJustifyIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"></path>
    </svg>
  );
}

export function ImageIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <path d="M21 15l-5-5L5 21"></path>
    </svg>
  );
}

export function TableIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="3" y1="9" x2="21" y2="9"></line>
      <line x1="3" y1="15" x2="21" y2="15"></line>
      <line x1="9" y1="3" x2="9" y2="21"></line>
      <line x1="15" y1="3" x2="15" y2="21"></line>
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18"></path>
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );
}
