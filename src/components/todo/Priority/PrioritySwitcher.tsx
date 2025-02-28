import React from 'react';
import { TodoPriority } from '../../../types/todo.ts';
import { PRIORITIES_SEQUENCE } from "./constants.ts";
import { PriorityIcon } from "./PriorityIcon.tsx";
import styles from './Priority.module.css';

export type FnPrioritySwitcherChange = (event: React.MouseEvent<HTMLButtonElement>, newValue: TodoPriority) => void

interface PrioritySwitcherProps {
  value: TodoPriority;
  onChange: FnPrioritySwitcherChange;
}

export const PrioritySwitcher: React.FC<PrioritySwitcherProps> = ({ value, onChange }) => {
  const handlePriorityChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const currentIndex = PRIORITIES_SEQUENCE.indexOf(value);
    const nextPriority = PRIORITIES_SEQUENCE[(currentIndex + 1) % PRIORITIES_SEQUENCE.length];

    onChange(event, nextPriority);
  };

  return (
    <button type="button" className={styles.prioritySwitcher} onClick={handlePriorityChange}>
      <PriorityIcon priority={value}/>
    </button>
  );
};
