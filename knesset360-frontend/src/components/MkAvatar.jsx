import './MkAvatar.css';

export default function MkAvatar({ id, name, size = 36 }) {
  const initials = name ? name.trim().split(' ').map(w => w[0]).slice(0, 2).join('') : '';

  const handleError = (e) => {
    if (!e.target.src.includes('.png')) {
      e.target.src = `/mk-photos/${id}.png`;
    } else {
      e.target.style.display = 'none';
      e.target.nextSibling.style.display = 'flex';
    }
  };

  return (
    <div className="mk-avatar" style={{ width: size, height: size }}>
      {id ? (
        <img
          src={`/mk-photos/${id}.jpg`}
          alt={name || ''}
          loading="lazy"
          className="mk-avatar-img"
          onError={handleError}
        />
      ) : null}
      <div
        className="mk-avatar-fallback"
        style={id ? { display: 'none' } : {}}
      >
        {initials}
      </div>
    </div>
  );
}