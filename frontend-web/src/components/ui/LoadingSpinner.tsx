'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva(
  'spinner',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      color: {
        primary: 'border-t-primary-600',
        white: 'border-t-white',
        gray: 'border-t-gray-600',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'primary',
    },
  }
);

type SpinnerVariantProps = VariantProps<typeof spinnerVariants>;

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  size?: SpinnerVariantProps['size'];
  color?: SpinnerVariantProps['color'];
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, color, text, ...props }, ref) => {
    if (text) {
      return (
        <div
          ref={ref}
          className={cn('flex items-center justify-center space-x-2', className)}
          {...props}
        >
          <div className={cn(spinnerVariants({ size, color }))} />
          <span className="text-sm text-gray-600">{text}</span>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, color }), className)}
        {...props}
      />
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

export { LoadingSpinner, spinnerVariants };



