export default function UserInfo({ user, onLogout }) {
  const initials = (user?.name || user?.email || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="user-info">
      <div className="avatar" aria-hidden>{initials}</div>
      <div className="user-meta">
        <div className="user-name">{user?.name || 'Utilisateur'}</div>
        <div className="user-email">{user?.email}</div>
      </div>
      <button onClick={onLogout}>Se déconnecter</button>
    </div>
  );
}


