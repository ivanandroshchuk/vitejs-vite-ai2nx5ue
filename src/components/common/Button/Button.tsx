import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import styles from './Button.module.css';
import clsx from 'clsx';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export const Button: React.FC<ButtonProps> = ({ children, className, type = 'button', ...rest }) =>
  <button className={clsx(styles.button, className)} type={type} {...rest}>{children}</button>;
