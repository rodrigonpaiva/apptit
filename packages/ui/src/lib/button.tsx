import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './button.module.css';

type Variant = 'primary' | 'ghost';

type ButtonProps = {
  variant?: Variant;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={clsx(styles.button, styles[variant], className)}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
