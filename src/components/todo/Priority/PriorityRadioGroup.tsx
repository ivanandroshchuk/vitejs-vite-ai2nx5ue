import React, { ChangeEvent } from 'react';
import clsx from "clsx";
import { TodoPriority } from '../../../types/todo.ts';
import { PRIORITIES_SEQUENCE } from "./constants.ts";
import { PriorityIcon } from "./PriorityIcon.tsx";
import styles from './Priority.module.css';

interface PriorityRadioGroupProps {
  disabled?: boolean;
  value: TodoPriority;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const PriorityRadioGroup: React.FC<PriorityRadioGroupProps> = ({ disabled, value, onChange }) => {
  return (
    <fieldset className={styles.radioGroup} role="radiogroup">
      {PRIORITIES_SEQUENCE.map((priorityItem) => {
        const checked = value === priorityItem;

        return (
          <label
            key={priorityItem}
            className={clsx(styles.radioLabel, { [styles.disabled]: disabled, [styles.checked]: checked })}
          >
            <input
              type="radio"
              name="priority"
              value={priorityItem}
              checked={checked}
              onChange={onChange}
              disabled={disabled}
              className={styles.radioInput}
            />

            <PriorityIcon priority={priorityItem}/>
          </label>
        );
      })}
    </fieldset>
  );
};
