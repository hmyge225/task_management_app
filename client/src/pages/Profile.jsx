import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      // 1) Update name/email
      const { data } = await api.put('/api/auth/me', { name, email });
      localStorage.setItem('user', JSON.stringify({ id: data.id, name: data.name, email: data.email }));
      await refreshUser();

      // 2) Change password if provided
      if (newPassword) {
        await api.post('/api/auth/change-password', { currentPassword, newPassword });
        setCurrentPassword('');
        setNewPassword('');
      }
      setMessage('Profil mis à jour');
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Mise à jour échouée');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1>Mon profil</h1>
      <motion.form
        className="card"
        style={{ maxWidth: 520 }}
        onSubmit={handleSave}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <label>
          Nom
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <div className="row" style={{ gap: 12 }}>
          <label style={{ flex: 1 }}>
            Mot de passe actuel
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </label>
          <label style={{ flex: 1 }}>
            Nouveau mot de passe
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </label>
        </div>
        {message && <p style={{ color: message.includes('échouée') ? '#dc2626' : 'green' }}>{message}</p>}
        <button disabled={saving} type="submit">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
      </motion.form>
    </div>
  );
}


