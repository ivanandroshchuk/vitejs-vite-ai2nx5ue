import React from 'react';
import styles from './Priority.module.css';
import { PRIORITY_ICONS } from "./constants.ts";
import { TodoPriority } from "../../../types/todo.ts";

interface PriorityIconProps {
  priority: TodoPriority;
}

export const PriorityIcon: React.FC<PriorityIconProps> = ({ priority }) => {
  return (
    <span className={styles.priorityIcon} title={priority}>
      {PRIORITY_ICONS[priority]}
    </span>
  );
};