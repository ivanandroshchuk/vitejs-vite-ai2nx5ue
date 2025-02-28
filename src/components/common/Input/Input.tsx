import React, { InputHTMLAttributes, Ref } from 'react';
import clsx from 'clsx';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  isInvalid?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export const Input: React.FC<InputProps> = ({ className, isInvalid, ...rest }) => (
  <input className={clsx(styles.input, { [styles.invalid]: isInvalid }, className)} {...rest} />
);
