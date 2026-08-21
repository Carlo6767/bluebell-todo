import type { Task } from '../types'

export function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const byTime = new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    return byTime || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
}

export function formatTime(value: string | Date) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}

export function formatDate(value: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(value)
}

export function endTime(task: Task) {
  if (!task.durationMinutes) return null
  return formatTime(new Date(new Date(task.startAt).getTime() + task.durationMinutes * 60_000))
}

export function isDue(task: Task, now: Date) {
  return !task.completed && task.alarm && !task.alarmHandled && new Date(task.startAt).getTime() <= now.getTime()
}
