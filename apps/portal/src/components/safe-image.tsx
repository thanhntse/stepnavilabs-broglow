import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { Package } from '@phosphor-icons/react/dist/ssr';

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackComponent?: React.ReactNode;
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackComponent,
  ...props
}) => {
  const [error, setError] = useState(false);

  if (error) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
        <Package size={32} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || "Image"}
      onError={() => setError(true)}
      unoptimized={typeof src === 'string' && !src.startsWith('/')}
      {...props}
    />
  );
};

export default SafeImage;
