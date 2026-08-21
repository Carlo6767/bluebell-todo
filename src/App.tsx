import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import type { Task, TaskDraft } from './types'
import { loadTasks, saveTasks } from './lib/taskStorage'
import { endTime, formatDate, formatTime, isDue, sortTasks } from './lib/time'

const emptyDraft = (): TaskDraft => ({ title: '', startAt: toLocalInput(new Date()), durationMinutes: null, alarm: false })

function toLocalInput(date: Date) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function App() {
  const [now, setNow] = useState(() => new Date())
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [draft, setDraft] = useState<TaskDraft>(emptyDraft)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => saveTasks(tasks), [tasks])

  useEffect(() => {
    const dueTasks = tasks.filter((task) => isDue(task, now))
    if (!dueTasks.length) return
    setTasks((current) => current.map((task) => isDue(task, now) ? { ...task, alarmHandled: true } : task))
    setNotice(`${dueTasks.length === 1 ? 'Your task is' : `${dueTasks.length} tasks are`} ready now.`)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Bluebell reminder', { body: dueTasks.map((task) => task.title).join(', ') })
    }
  }, [now, tasks])

  const sortedTasks = useMemo(() => sortTasks(tasks), [tasks])
  const activeCount = tasks.filter((task) => !task.completed).length
  const missedCount = tasks.filter((task) => task.alarm && new Date(task.startAt) < now && !task.completed).length

  function updateDraft(field: keyof TaskDraft, value: string | boolean) {
    setDraft((current) => ({ ...current, [field]: field === 'durationMinutes' ? (value ? Number(value) : null) : value }))
  }

  async function addTask(event: FormEvent) {
    event.preventDefault()
    if (!draft.title.trim() || !draft.startAt) return
    if (draft.alarm && 'Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
    const task: Task = { ...draft, title: draft.title.trim(), id: crypto.randomUUID(), completed: false, alarmHandled: false, createdAt: new Date().toISOString() }
    setTasks((current) => [...current, task])
    setDraft(emptyDraft())
    setNotice('Added to your little plan.')
  }

  function toggleTask(id: string) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task))
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id))
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">✦</span><span>bluebell</span><span className="brand-dot">todo</span></div>
        <div className="header-date">{formatDate(now)}</div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">a softer way to get things done</p>
          <h1>Make room for<br /><em>what matters.</em></h1>
          <p className="hero-copy">Your day, gently arranged. Add a little plan and let bluebell keep time with you.</p>
        </div>
        <div className="clock-panel" aria-label="Current time">
          <span className="clock-label">right now</span>
          <strong>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
          <span className="clock-pulse"><i /> live clock</span>
        </div>
      </section>

      <div className="layout">
        <section className="schedule-section">
          <div className="section-heading">
            <div><p className="eyebrow">your timeline</p><h2>Today's little list <span>{activeCount}</span></h2></div>
            <div className="status-note">{missedCount ? `${missedCount} reminder${missedCount > 1 ? 's' : ''} waiting` : 'all caught up'}</div>
          </div>
          {notice && <div className="notice" role="status"><span>✦</span>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notice">×</button></div>}
          {sortedTasks.length === 0 ? <div className="empty-state"><div className="empty-sparkle">✧</div><h3>A blank little canvas</h3><p>What would feel good to finish today?</p></div> : <div className="task-list">{sortedTasks.map((task, index) => <article className={`task ${task.completed ? 'is-complete' : ''}`} key={task.id} style={{ '--delay': `${index * 70}ms` } as CSSProperties}>
            <button className="check" onClick={() => toggleTask(task.id)} aria-label={task.completed ? `Mark ${task.title} active` : `Complete ${task.title}`}>{task.completed ? '✓' : ''}</button>
            <div className="task-time"><strong>{formatTime(task.startAt)}</strong>{endTime(task) && <span>until {endTime(task)}</span>}</div>
            <div className="task-content"><h3>{task.title}</h3><div className="task-meta">{task.durationMinutes ? <span>◷ {task.durationMinutes} min</span> : <span>open time</span>}{task.alarm && <span className="alarm">♧ reminder {task.alarmHandled ? 'sent' : 'on'}</span>}</div></div>
            <button className="delete" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`}>×</button>
          </article>)}</div>}
        </section>

        <aside className="add-panel"><div className="panel-kicker">✦ add a plan</div><h2>What is calling<br /><em>your attention?</em></h2>
          <form onSubmit={addTask}>
            <label>Task name<input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} placeholder="e.g. sketch some ideas" required /></label>
            <label>Start time<input type="datetime-local" value={draft.startAt} onChange={(event) => updateDraft('startAt', event.target.value)} required /></label>
            <label>How long? <span className="optional">optional</span><div className="input-suffix"><input type="number" min="1" max="1440" value={draft.durationMinutes ?? ''} onChange={(event) => updateDraft('durationMinutes', event.target.value)} placeholder="30" /><span>minutes</span></div></label>
            <label className="toggle-row"><span><strong>Little reminder</strong><small>Ask me when it is time</small></span><input className="toggle" type="checkbox" checked={draft.alarm} onChange={(event) => updateDraft('alarm', event.target.checked)} /></label>
            <button className="add-button" type="submit">Add to my day <span>↗</span></button>
          </form>
          <p className="privacy-note">Your plans stay right here on this device.</p>
        </aside>
      </div>
      <footer><span>bluebell / {now.getFullYear()}</span><span>take it one thing at a time</span></footer>
    </main>
  )
}

export default App
