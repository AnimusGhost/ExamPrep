import { ComponentProps } from 'react';
import { Link, LinkProps } from 'react-router-dom';

const variants = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  ghost: 'btn btn-ghost'
} as const;

type ButtonProps = ComponentProps<'button'> & {
  variant?: keyof typeof variants;
};

type ButtonLinkProps = LinkProps & {
  variant?: keyof typeof variants;
  as: typeof Link;
};

const Button = ({ variant = 'primary', className = '', ...props }: ButtonProps | ButtonLinkProps) => {
  if ('to' in props && props.as === Link) {
    const { as: Component, ...linkProps } = props as ButtonLinkProps;
    return <Component className={`${variants[variant]} ${className}`} {...linkProps} />;
  }
  const buttonProps = props as ButtonProps;
  return <button className={`${variants[variant]} ${className}`} {...buttonProps} />;
};

export default Button;
