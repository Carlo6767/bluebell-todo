import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import type { Task, TaskDraft } from './types'
import { loadTasks, saveTasks } from './lib/taskStorage'
import { formatDate, formatTime, sortTasks } from './lib/time'

const emptyDraft = (): TaskDraft => {
  const start = new Date()
  const end = new Date(start.getTime() + 30 * 60_000)
  return { title: '', startAt: toLocalInput(start), endAt: toLocalInput(end) }
}

const cheerUpQuotes = [
  'Small steps still move you forward.',
  'You are allowed to take up space and take your time.',
  'Progress counts, even when it feels tiny.',
  'Today does not need to be perfect to be good.',
  'You can do hard things one gentle step at a time.',
  'Your best looks different every day, and that is okay.',
  'There is no rush to become who you are becoming.',
  'You have made it through every difficult day so far.',
  'A little progress is still progress worth celebrating.',
  'Be proud of yourself for showing up today.',
  'You bring something to the world that nobody else can.',
  'Rest is part of the plan, not a failure of the plan.',
  'You do not have to do everything today.',
  'One kind choice for yourself can change the whole day.',
  'The next small thing is enough for right now.',
  'You are doing better than your tired brain tells you.',
  'Your pace is valid. Keep going your way.',
  'There is still something lovely waiting in today.',
  'You are worthy of patience, especially from yourself.',
  'A fresh start can happen at any moment.',
  'Your effort matters, even before the result arrives.',
  'You have permission to make today a little easier.',
  'Keep a little room for good surprises.',
  'You are not behind. You are on your own path.',
  'Celebrate the things you used to wish you could do.',
  'You can begin again without starting from nothing.',
  'Your future self will be glad you took this step.',
  'Let today be simple, steady, and yours.',
  'You are more capable than this moment feels.',
  'Something good can grow from one small beginning.',
]

function toLocalInput(date: Date) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function App() {
  const [now, setNow] = useState(() => new Date())
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [draft, setDraft] = useState<TaskDraft>(emptyDraft)
  const [notice, setNotice] = useState('')
  const [darkMode, setDarkMode] = useState(() => typeof window !== 'undefined' && localStorage.getItem('bluebell-theme') === 'dark')
  const [cheerUpQuote] = useState(() => cheerUpQuotes[Math.floor(Math.random() * cheerUpQuotes.length)])
  const [userName, setUserName] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('bluebell-name') || '' : '')
  const [nameInput, setNameInput] = useState('')

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => saveTasks(tasks), [tasks])

  useEffect(() => {
    document.body.classList.toggle('dark-page', darkMode)
    localStorage.setItem('bluebell-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const sortedTasks = useMemo(() => sortTasks(tasks), [tasks])
  const activeCount = tasks.filter((task) => !task.completed).length
  const timeGreeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 18 ? 'Good Afternoon' : 'Good Evening'
  const greeting = `${timeGreeting}, ${userName}`

  function updateDraft(field: keyof TaskDraft, value: string | boolean) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  async function addTask(event: FormEvent) {
    event.preventDefault()
    if (!draft.title.trim() || !draft.startAt) return
    if (!draft.endAt || new Date(draft.endAt).getTime() <= new Date(draft.startAt).getTime()) {
      setNotice('End time needs to be after the start time.')
      return
    }
    const task: Task = { ...draft, title: draft.title.trim(), id: crypto.randomUUID(), completed: false, createdAt: new Date().toISOString() }
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

  function saveName(event: FormEvent) {
    event.preventDefault()
    const name = nameInput.trim()
    if (!name) return
    localStorage.setItem('bluebell-name', name)
    setUserName(name)
  }

  if (!userName) {
    return <main className={`app-shell welcome-shell ${darkMode ? 'dark-mode' : ''}`}>
      <section className="welcome-panel">
        <div className="welcome-sparkle">✦</div>
        <p className="eyebrow">a little space for your day</p>
        <h1>First, tell me<br /><em>your name.</em></h1>
        <p className="hero-copy">We will use it to make your daily welcome feel a little more like yours.</p>
        <form className="welcome-form" onSubmit={saveName}>
          <label>Your name<input value={nameInput} onChange={(event) => setNameInput(event.target.value)} placeholder="e.g. Carlo" autoFocus required /></label>
          <button className="add-button" type="submit">Open my planner <span>↗</span></button>
        </form>
        <p className="privacy-note">Your name stays on this device.</p>
      </section>
    </main>
  }

  return (
    <main className={`app-shell ${darkMode ? 'dark-mode' : ''}`}>
      <header className="topbar">
        <button className="theme-toggle" onClick={() => setDarkMode((current) => !current)} aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`} title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}>
          <span aria-hidden="true">{darkMode ? '☀' : '☾'}</span> {darkMode ? 'light mode' : 'dark mode'}
        </button>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">a softer way to get things done</p>
          <h1>{greeting},<br /><em>you've got this.</em></h1>
          <p className="hero-copy">Your day, gently arranged. Add a little plan and keep your time feeling clear.</p>
          <blockquote className="cheer-quote">“{cheerUpQuote}”</blockquote>
        </div>
        <div className="clock-panel" aria-label="Current time">
          <span className="clock-label">right now</span>
          <strong>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
          <span className="clock-date">{formatDate(now)}</span>
          <span className="clock-pulse"><i /> live clock</span>
        </div>
      </section>

      <div className="layout">
        <section className="schedule-section">
          <div className="section-heading">
            <div><p className="eyebrow">your timeline</p><h2>Today's little list <span>{activeCount}</span></h2></div>
            <div className="status-note">{activeCount ? 'a calm plan for today' : 'all caught up'}</div>
          </div>
          {notice && <div className="notice" role="status"><span>✦</span>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notice">×</button></div>}
          {sortedTasks.length === 0 ? <div className="empty-state"><div className="empty-sparkle">✧</div><h3>A blank little canvas</h3><p>What would feel good to finish today?</p></div> : <div className="task-list">{sortedTasks.map((task, index) => <article className={`task ${task.completed ? 'is-complete' : ''}`} key={task.id} style={{ '--delay': `${index * 70}ms` } as CSSProperties}>
            <button className="check" onClick={() => toggleTask(task.id)} aria-label={task.completed ? `Mark ${task.title} active` : `Complete ${task.title}`}>{task.completed ? '✓' : ''}</button>
            <div className="task-time"><strong>{formatTime(task.startAt)}</strong><span>until {formatTime(task.endAt)}</span></div>
            <div className="task-content"><h3>{task.title}</h3><div className="task-meta"><span>scheduled time</span></div></div>
            <button className="delete" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`}>×</button>
          </article>)}</div>}
        </section>

        <aside className="add-panel"><div className="panel-kicker">✦ add a plan</div><h2>What is calling<br /><em>your attention?</em></h2>
          <form onSubmit={addTask}>
            <label>Task name<input value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} placeholder="e.g. sketch some ideas" required /></label>
            <label>Start time<input type="datetime-local" value={draft.startAt} onChange={(event) => updateDraft('startAt', event.target.value)} required /></label>
            <label>End time<input type="datetime-local" value={draft.endAt} min={draft.startAt} onChange={(event) => updateDraft('endAt', event.target.value)} required /></label>
            <button className="add-button" type="submit">Add to my day <span>↗</span></button>
          </form>
          <p className="privacy-note">Your plans stay right here on this device.</p>
        </aside>
      </div>
    </main>
  )
}

export default App
