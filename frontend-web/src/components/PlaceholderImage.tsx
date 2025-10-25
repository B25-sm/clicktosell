'use client';

interface PlaceholderImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackText?: string;
}

export function PlaceholderImage({ 
  src, 
  alt, 
  className = '', 
  fallbackText = 'No Image' 
}: PlaceholderImageProps) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.src = `data:image/svg+xml;base64,${btoa(`
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" 
              fill="#666666" text-anchor="middle" dy=".3em">${fallbackText}</text>
      </svg>
    `)}`;
  };

  return (
    <img 
      src={src || `data:image/svg+xml;base64,${btoa(`
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f3f4f6"/>
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" 
                fill="#666666" text-anchor="middle" dy=".3em">${fallbackText}</text>
        </svg>
      `)}`}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}
