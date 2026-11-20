import { forwardRef, type ReactNode } from 'react';
import {
  Button as AriaButton,
  Link as AriaLink,
  type ButtonProps as AriaButtonProps,
  type LinkProps as AriaLinkProps,
} from 'react-aria-components';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

/** An accessible name is mandatory: visible children, or aria-label for icon-only buttons. */
type AccessibleName =
  | { children: ReactNode; 'aria-label'?: string }
  | { children?: ReactNode; 'aria-label': string };

type Common = AccessibleName & {
  /** Visual style. Matches the Figma `variant` property. */
  variant?: Variant;
  /** Control size. Matches the Figma `size` property. */
  size?: Size;
  /** Stretch to the container width. */
  fullWidth?: boolean;
  className?: string;
};

type AsButton = Common & Omit<AriaButtonProps, 'children' | 'className' | 'style'> & { href?: undefined };
type AsLink = Common & Omit<AriaLinkProps, 'children' | 'className' | 'style'> & { href: string };

export type ButtonProps = AsButton | AsLink;

export const buttonClassName = ({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
}: Pick<Common, 'variant' | 'size' | 'fullWidth' | 'className'>) =>
  [
    'oz-button',
    variant !== 'primary' && `oz-button--${variant}`,
    size !== 'md' && `oz-button--${size}`,
    fullWidth && 'oz-button--full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

/**
 * Primary action control. Renders a `<button>`, or an `<a>` when `href` is set.
 * Behaviour (press, keyboard, focus-visible, disabled) comes from React Aria;
 * styling comes from `.oz-button` in `@ozzyos/css`.
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(props, ref) {
  const { variant, size, fullWidth, className, ...rest } = props;
  const cls = buttonClassName({ variant, size, fullWidth, className });

  if (rest.href !== undefined) {
    return <AriaLink {...(rest as AriaLinkProps)} ref={ref as React.Ref<HTMLAnchorElement>} className={cls} />;
  }
  return (
    <AriaButton
      type="button"
      {...(rest as AriaButtonProps)}
      ref={ref as React.Ref<HTMLButtonElement>}
      className={cls}
    />
  );
});
