import React from 'react';

const OptimizedImage = ({ src, alt, width, height, className }) => {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = '/fallback-image.png'; // Add a fallback image
      }}
    />
  );
};

export default OptimizedImage; 