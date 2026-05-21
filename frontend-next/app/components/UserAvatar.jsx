'use client';

import { useEffect, useMemo, useState } from 'react';

function getInitials(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return 'U';

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

export default function UserAvatar({ src, name, size = 'md', className = '' }) {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [src]);

  const initials = useMemo(() => getInitials(name), [name]);
  const shouldShowImage = Boolean(src) && !hasImageError;

  const avatarClassName = [
    'user-avatar',
    `user-avatar--${size}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={avatarClassName} aria-label={name || 'Profile avatar'}>
      {shouldShowImage ? (
        <img
          src={src}
          alt={name || 'Profile avatar'}
          className="user-avatar__image"
          onError={() => setHasImageError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="user-avatar__fallback" aria-hidden="true">
          {initials}
        </span>
      )}
    </span>
  );
}