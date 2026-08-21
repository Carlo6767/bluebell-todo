import type { Task } from '../types'

const STORAGE_KEY = 'bluebell-tasks'

export function loadTasks(): Task[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isTask).map(normalizeTask)
  } catch {
    return []
  }
}

export function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch {
    // Storage may be blocked by private browsing settings.
  }
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false
  const task = value as Partial<Task>
  return typeof task.id === 'string' && typeof task.title === 'string' &&
    typeof task.startAt === 'string' && typeof task.completed === 'boolean' &&
    typeof task.createdAt === 'string' &&
    (typeof task.endAt === 'string' || task.endAt === undefined)
}

function normalizeTask(task: Task): Task {
  if (task.endAt) return task
  const legacyTask = task as Task & { durationMinutes?: number | null }
  const duration = legacyTask.durationMinutes || 30
  return { ...task, endAt: new Date(new Date(task.startAt).getTime() + duration * 60_000).toISOString() }
}
