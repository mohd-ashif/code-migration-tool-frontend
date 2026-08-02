import React from 'react';

export type TypographyVariant =
  | 'displayXl'
  | 'displayLg'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'title'
  | 'subtitle'
  | 'bodyLg'
  | 'bodyMd'
  | 'bodySm'
  | 'caption'
  | 'label'
  | 'helper'
  | 'error';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  truncate?: boolean;
}

const variantStyles: Record<TypographyVariant, string> = {
  displayXl: 'text-4xl sm:text-5xl font-extrabold tracking-tight text-white',
  displayLg: 'text-3xl sm:text-4xl font-bold tracking-tight text-white',
  h1: 'text-2xl sm:text-3xl font-bold tracking-tight text-white',
  h2: 'text-xl sm:text-2xl font-semibold tracking-tight text-white',
  h3: 'text-lg sm:text-xl font-semibold text-white',
  h4: 'text-base sm:text-lg font-semibold text-white',
  title: 'text-base font-semibold text-white',
  subtitle: 'text-sm font-medium text-zinc-400',
  bodyLg: 'text-base font-normal text-zinc-200',
  bodyMd: 'text-sm font-normal text-zinc-300',
  bodySm: 'text-xs font-normal text-zinc-400',
  caption: 'text-xs font-medium text-zinc-400 uppercase tracking-wider',
  label: 'text-sm font-semibold text-zinc-200',
  helper: 'text-xs font-normal text-zinc-400',
  error: 'text-xs font-medium text-danger',
};

const defaultElementMap: Record<TypographyVariant, React.ElementType> = {
  displayXl: 'h1',
  displayLg: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  title: 'h5',
  subtitle: 'p',
  bodyLg: 'p',
  bodyMd: 'p',
  bodySm: 'p',
  caption: 'span',
  label: 'label',
  helper: 'span',
  error: 'span',
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'bodyMd',
  as,
  children,
  className = '',
  truncate = false,
  ...props
}) => {
  const Component = as || defaultElementMap[variant] || 'p';
  const classes = [
    variantStyles[variant],
    truncate ? 'truncate' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

export default Typography;
