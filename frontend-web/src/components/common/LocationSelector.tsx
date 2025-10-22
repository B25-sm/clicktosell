'use client';

import React from 'react';

type Props = {
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
};

export function LocationSelector({ value = '', onChange, className }: Props) {
  return (
    <input
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder="Select location"
      className={`border rounded-lg px-3 py-2 text-sm ${className || ''}`}
    />
  );
}


