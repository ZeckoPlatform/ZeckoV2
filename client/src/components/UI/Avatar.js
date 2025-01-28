import React from 'react';
import OptimizedImage from '../common/OptimizedImage';

const Avatar = ({ src, alt, size = 40 }) => {
  return (
    <div className="avatar-container" style={{ width: size, height: size }}>
      <OptimizedImage
        src={src || '/default-avatar.png'}
        alt={alt || 'User avatar'}
        width={size}
        height={size}
        className="avatar-image"
      />
    </div>
  );
};

export default Avatar; 