import { Link } from "react-router-dom";

const VARIANTS = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-blue-50 text-blue-700 hover:bg-blue-100",
  outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-slate-600 hover:bg-slate-100",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

/**
 * Shared button. Renders as a <button>, a router <Link>, or an <a>
 * depending on which props are passed.
 *
 * Props:
 *  - variant: "primary" | "secondary" | "outline" | "danger" | "ghost"
 *  - size: "sm" | "md" | "lg"
 *  - icon: a lucide-react icon component
 *  - iconPosition: "left" | "right"           (default "right")
 *  - to: router path -> renders <Link>
 *  - href: external url -> renders <a>
 *  - otherwise renders a native <button>
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "right",
  to,
  href,
  type = "button",
  disabled = false,
  className = "",
  onClick,
  ...rest
}) {
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    className,
  ].join(" ");

  const content = (
    <>
      {Icon && iconPosition === "left" && <Icon size={18} />}
      {children}
      {Icon && iconPosition === "right" && <Icon size={18} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
      {...rest}
    >
      {content}
    </button>
  );
}
