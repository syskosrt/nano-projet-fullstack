import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Loader2, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'
const emptyForm = { title: '', description: '', completed: false }

async function apiRequest(path, options) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.message ?? 'Une erreur est survenue.')
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function App() {
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length
    return {
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
    }
  }, [tasks])

  const loadTasks = useCallback(async () => {
    try {
      setError('')
      setLoading(true)
      const data = await apiRequest('/tasks')
      setTasks(data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function startEdit(task) {
    setEditingId(task.id)
    setForm({
      title: task.title,
      description: task.description,
      completed: task.completed,
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('Le titre est obligatoire.')
      return
    }

    try {
      setError('')
      setSaving(true)
      const payload = {
        title: form.title,
        description: form.description,
        completed: form.completed,
      }

      if (editingId) {
        const updatedTask = await apiRequest(`/tasks/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        setTasks((currentTasks) =>
          currentTasks.map((task) => (task.id === editingId ? updatedTask : task)),
        )
      } else {
        const createdTask = await apiRequest('/tasks', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setTasks((currentTasks) => [createdTask, ...currentTasks])
      }

      resetForm()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleTask(task) {
    try {
      setError('')
      const updatedTask = await apiRequest(`/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...task, completed: !task.completed }),
      })
      setTasks((currentTasks) =>
        currentTasks.map((item) => (item.id === task.id ? updatedTask : item)),
      )
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function deleteTask(taskId) {
    try {
      setError('')
      await apiRequest(`/tasks/${taskId}`, { method: 'DELETE' })
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))

      if (editingId === taskId) {
        resetForm()
      }
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <span className="eyebrow">React + Node</span>
          <h1>Gestionnaire CRUD</h1>
          <p>Une app complete branchee sur une API Express locale.</p>
        </div>
        <button className="icon-button" type="button" onClick={loadTasks} aria-label="Rafraichir">
          <RefreshCw size={20} />
        </button>
      </section>

      <section className="stats-grid" aria-label="Statistiques">
        <article>
          <span>Total</span>
          <strong>{stats.total}</strong>
        </article>
        <article>
          <span>En cours</span>
          <strong>{stats.pending}</strong>
        </article>
        <article>
          <span>Terminees</span>
          <strong>{stats.completed}</strong>
        </article>
      </section>

      <section className="workspace">
        <form className="task-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>{editingId ? 'Modifier une tache' : 'Nouvelle tache'}</h2>
            {editingId ? (
              <button className="ghost-button" type="button" onClick={resetForm}>
                <X size={18} />
                Annuler
              </button>
            ) : null}
          </div>

          <label>
            Titre
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Ex: Preparer la demo"
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Details, contexte, prochaine action..."
              rows="5"
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.completed}
              onChange={(event) => setForm({ ...form, completed: event.target.checked })}
            />
            Marquer comme terminee
          </label>

          {error ? <p className="error-message">{error}</p> : null}

          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
            {editingId ? 'Enregistrer' : 'Ajouter'}
          </button>
        </form>

        <section className="task-list" aria-label="Liste des taches">
          {loading ? (
            <div className="empty-state">
              <Loader2 className="spin" size={24} />
              Chargement des taches...
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">Aucune tache pour le moment.</div>
          ) : (
            tasks.map((task) => (
              <article className={task.completed ? 'task-card is-complete' : 'task-card'} key={task.id}>
                <button
                  className="status-button"
                  type="button"
                  onClick={() => toggleTask(task)}
                  aria-label={task.completed ? 'Marquer en cours' : 'Marquer terminee'}
                >
                  {task.completed ? <Check size={18} /> : null}
                </button>

                <div className="task-content">
                  <h2>{task.title}</h2>
                  <p>{task.description || 'Aucune description.'}</p>
                  <time dateTime={task.updatedAt}>
                    Mis a jour le {new Date(task.updatedAt).toLocaleDateString('fr-FR')}
                  </time>
                </div>

                <div className="task-actions">
                  <button type="button" onClick={() => startEdit(task)} aria-label="Modifier">
                    <Pencil size={18} />
                  </button>
                  <button type="button" onClick={() => deleteTask(task.id)} aria-label="Supprimer">
                    <Trash2 size={18} />
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </section>
    </main>
  )
}

export default App
