import React from 'react';
import styles from './Error.module.css';

interface ErrorProps {
  message?: string | null;
}

export const Error: React.FC<ErrorProps> = ({ message }) => {
  return <div className={styles.error}>{message || 'Something went wrong'}</div>;
};
