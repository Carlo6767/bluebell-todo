export type Task = {
  id: string
  title: string
  startAt: string
  durationMinutes: number | null
  alarm: boolean
  completed: boolean
  alarmHandled: boolean
  createdAt: string
}

export type TaskDraft = Pick<Task, 'title' | 'startAt' | 'durationMinutes' | 'alarm'>
