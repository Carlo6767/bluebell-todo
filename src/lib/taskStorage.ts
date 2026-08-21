import type { Task } from '../types'

const STORAGE_KEY = 'bluebell-tasks'

export function loadTasks(): Task[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isTask)
  } catch {
    return []
  }
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false
  const task = value as Partial<Task>
  return typeof task.id === 'string' && typeof task.title === 'string' &&
    typeof task.startAt === 'string' && typeof task.completed === 'boolean' &&
    typeof task.alarm === 'boolean' && typeof task.alarmHandled === 'boolean' &&
    (task.durationMinutes === null || typeof task.durationMinutes === 'number')
}
