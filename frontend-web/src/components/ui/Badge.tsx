'use client';

import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'error' | 'success' | 'warning';
  size?: 'sm' | 'md';
};

export function Badge({ children, className = '', variant = 'default', size = 'md' }: Props) {
  const variantClasses: Record<string, string> = {
    default: 'bg-gray-200 text-gray-800',
    error: 'bg-red-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-400 text-black'
  };
  const sizeClasses: Record<string, string> = {
    sm: 'text-xs px-1.5 py-0.5 rounded',
    md: 'text-sm px-2 py-1 rounded'
  };
  return (
    <span className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}>{children}</span>
  );
}


