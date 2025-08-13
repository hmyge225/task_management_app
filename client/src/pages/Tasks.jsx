import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import UserInfo from '../components/UserInfo';

export default function Tasks() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const emptyForm = useMemo(
    () => ({ title: '', description: '', dueDate: '', status: 'todo', priority: 'medium' }),
    []
  );
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

	// Edition inline d'une tâche
	const [editTaskId, setEditTaskId] = useState(null);
	const [editForm, setEditForm] = useState(emptyForm);

	const formatDateInput = (dateString) => {
		if (!dateString) return '';
		try {
			const d = new Date(dateString);
			const yyyy = d.getFullYear();
			const mm = String(d.getMonth() + 1).padStart(2, '0');
			const dd = String(d.getDate()).padStart(2, '0');
			return `${yyyy}-${mm}-${dd}`;
		} catch (_) {
			return '';
		}
	};

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    (async () => {
      try {
        const { data } = await api.get('/api/tasks');
        setTasks(data);
      } catch (err) {
        setError('Impossible de charger les tâches');
      } finally {
        setLoading(false);
      }
    })();
  }, [user, navigate]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/api/tasks', {
        ...form,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
      });
      setTasks((prev) => [data, ...prev]);
      setForm(emptyForm);
    } catch (_) {
      setError("Création de tâche échouée");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (taskId, updates) => {
    try {
      const { data } = await api.put(`/api/tasks/${taskId}`, updates);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? data : t)));
		} catch (_) {
      setError('Mise à jour échouée');
    }
  };

	const startEdit = (task) => {
		setEditTaskId(task._id);
		setEditForm({
			title: task.title || '',
			description: task.description || '',
			dueDate: formatDateInput(task.dueDate),
			status: task.status || 'todo',
			priority: task.priority || 'medium',
		});
	};

	const cancelEdit = () => {
		setEditTaskId(null);
	};

	const saveEdit = async (taskId) => {
		const payload = {
			title: editForm.title,
			description: editForm.description,
			dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : undefined,
			status: editForm.status,
			priority: editForm.priority,
		};
		await handleUpdate(taskId, payload);
		setEditTaskId(null);
	};

  const handleDelete = async (taskId) => {
    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (_) {
      setError('Suppression échouée');
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="container">
      <header className="toolbar">
        <h1>Mes tâches</h1>
        <UserInfo user={user} onLogout={logout} />
      </header>

      {error && <p className="error">{error}</p>}

      <motion.form
        onSubmit={handleCreate}
        className="card grid"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <input
          placeholder="Titre"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <input
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
        />
        <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
          <option value="todo">A faire</option>
          <option value="in_progress">En cours</option>
          <option value="done">Terminée</option>
        </select>
        <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
          <option value="low">Faible</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
        </select>
        <button className="btn btn-primary" disabled={saving} type="submit">{saving ? 'Ajout...' : 'Ajouter'}</button>
      </motion.form>

		<ul className="list">
			<AnimatePresence initial={false}>
			{tasks.map((task) => (
				<motion.li key={task._id} className="card" layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
					{editTaskId === task._id ? (
						<form className="grid" onSubmit={(e) => { e.preventDefault(); saveEdit(task._id); }}>
							<input
								placeholder="Titre"
								value={editForm.title}
								onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
								required
							/>
							<input
								placeholder="Description"
								value={editForm.description}
								onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
							/>
							<input
								type="date"
								value={editForm.dueDate}
								onChange={(e) => setEditForm((f) => ({ ...f, dueDate: e.target.value }))}
							/>
							<select value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
								<option value="todo">A faire</option>
								<option value="in_progress">En cours</option>
								<option value="done">Terminée</option>
							</select>
							<select value={editForm.priority} onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value }))}>
								<option value="low">Faible</option>
								<option value="medium">Moyenne</option>
								<option value="high">Haute</option>
							</select>
							<div className="actions">
								<button type="submit">Enregistrer</button>
								<button type="button" onClick={cancelEdit}>Annuler</button>
							</div>
						</form>
					) : (
						<>
							<div className="row">
								<strong>{task.title}</strong>
								<div className="actions">
                  <select
										value={task.status}
										onChange={(e) => handleUpdate(task._id, { status: e.target.value })}
									>
										<option value="todo">A faire</option>
										<option value="in_progress">En cours</option>
										<option value="done">Terminée</option>
									</select>
                  <motion.button whileTap={{ scale: 0.98 }} className="btn" onClick={() => startEdit(task)}>Modifier</motion.button>
                  <motion.button whileTap={{ scale: 0.98 }} className="btn btn-danger" onClick={() => handleDelete(task._id)}>Supprimer</motion.button>
								</div>
							</div>
							{task.description && <p>{task.description}</p>}
              <div className="meta">
                {task.dueDate && <span>Echéance: {new Date(task.dueDate).toLocaleDateString()}</span>}
                <span className={`badge priority-${task.priority}`}>Priorité: {task.priority}</span>
                <span className={`badge ${task.status}`}>Etat: {task.status}</span>
              </div>
						</>
					)}
				</motion.li>
			))}
			</AnimatePresence>
		</ul>
    </div>
  );
}


