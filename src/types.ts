export type Task = {
  id: string
  title: string
  startAt: string
  endAt: string
  completed: boolean
  createdAt: string
}

export type TaskDraft = Pick<Task, 'title' | 'startAt' | 'endAt'>
