import React from 'react';
import styles from './Loading.module.css';
import clsx from "clsx";

const SUZE_STYLES = {
  'small': styles.small,
  'medium': styles.medium,
};

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'small' | 'medium';
}

export const Loader: React.FC<LoaderProps> = ({ size = 'medium', className, ...rest }) => {
  return <div className={clsx(styles.loader, SUZE_STYLES[size], className)} {...rest} />;
};
