import { TodoPriority } from "../../../types/todo.ts";

export const PRIORITY_ICONS = {
  [TodoPriority.LOW]: '🟢',
  [TodoPriority.MEDIUM]: '🟡',
  [TodoPriority.HIGH]: '🔴',
}

export const PRIORITIES_SEQUENCE = [TodoPriority.LOW, TodoPriority.MEDIUM, TodoPriority.HIGH]