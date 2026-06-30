import { useState, useEffect } from 'react';
import './MkAvatar.css';

const EXTENSIONS = ['jpg', 'png', 'jpeg'];

export default function MkAvatar({ id, name, size = 48 }) {
  // index into EXTENSIONS to try next; once it exceeds the list, show initials
  const [extIndex, setExtIndex] = useState(0);

  // Reset whenever we're asked to show a different person, so a previous
  // failure (or success) never leaks into the next render at this slot.
  useEffect(() => {
    setExtIndex(0);
  }, [id]);

  const initials = name ? name.trim().split(' ').map(w => w[0]).slice(0, 2).join('') : '';

  const handleError = () => {
    setExtIndex(prev => prev + 1);
  };

  const showImage = id && extIndex < EXTENSIONS.length;
  const currentExt = EXTENSIONS[extIndex];

  return (
    <div className="mk-avatar" style={{ width: size, height: size }}>
      {showImage ? (
        <img
          key={`${id}-${currentExt}`}
          src={`/mk-photos/${id}.${currentExt}`}
          alt={name || ''}
          loading="lazy"
          className="mk-avatar-img"
          onError={handleError}
        />
      ) : (
        <div className="mk-avatar-fallback">{initials}</div>
      )}
    </div>
  );
}