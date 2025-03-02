import { ChangeEvent, useActionState, useCallback, useRef, useState } from 'react';
import { Input } from '../../common/Input/Input.tsx';
import { Button } from '../../common/Button/Button.tsx';
import { useAppDispatch } from '../../../hooks/useAppDispatch.ts';
import { addTodo } from '../../../store/features/todos/todosSlice.ts';
import { TodoPriority } from '../../../types/todo.ts';
import { PriorityRadioGroup } from '../Priority/PriorityRadioGroup.tsx';
import styles from './TodoForm.module.css';

enum FormFieldName {
  TITLE = 'title',
  PRIORITY = 'priority',
}

interface FieldState<T> {
  value: T;
  isValid?: boolean;
}

interface FormState {
  [FormFieldName.TITLE]: FieldState<string>;
  [FormFieldName.PRIORITY]: FieldState<TodoPriority>;
}

const initialFormState: FormState = {
  [FormFieldName.TITLE]: { value: '', isValid: false },
  [FormFieldName.PRIORITY]: { value: TodoPriority.LOW },
}

const validator = <K extends FormFieldName>(name: K, value: string) => {
  if (name === FormFieldName.TITLE) {
    const trimmedValue = value.trim();

    return { value, isValid: !!trimmedValue && trimmedValue.length <= 100 };
  }

  return { value };
};

export const TodoForm = () => {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  const [formState, setFormState] = useState<FormState>(initialFormState);

  // If the form expands, a similar validation approach can be used, but it should be memoized
  // const isFormValid = Object.values(formState).every((field) => 'isValid' in field && field.isValid);
  const isFormValid = formState.title.isValid;

  // Using useCallback because TodoForm updates frequently due to the input field,
  // and the handleChange function has no dependencies
  const handleChange = useCallback(({ target: { value, name } }: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      [name]: validator(name as FormFieldName, value),
    }));
  }, []);

  const [actionState, submitAction, isPending] = useActionState<{ attempted: boolean, message?: string }>(
    async () => {
      if (!isFormValid) {
        return { attempted: true };
      }

      try {
        await dispatch(addTodo({
          title: formState.title.value,
          priority: formState.priority.value,
        })).unwrap();
      } catch (error) {
        return { attempted: true, message: (error as Error).message };
      }

      setFormState(initialFormState);

      return { attempted: false };
    },
    { attempted: false }
  );

  return (
    <div className={styles.root}>
      <span className={styles.title}>Add todo</span>
      <form className={styles.form} action={submitAction}>
        <Input
          ref={inputRef}
          name={FormFieldName.TITLE}
          value={formState.title.value}
          onChange={handleChange}
          placeholder="Todo title"
          isInvalid={actionState.attempted && !formState.title.isValid}
          disabled={isPending}
        />


        <PriorityRadioGroup
          value={formState.priority.value}
          onChange={handleChange}
          disabled={isPending}
        />

        <Button
          type="submit"
          disabled={(actionState.attempted && !isFormValid) || isPending}
        >
          {isPending ? '...' : 'Add Todo'}
        </Button>
      </form>

      {!!actionState.message && (
        <div className={styles.error}>
          {actionState.message}
        </div>
      )}
    </div>
  );
};
