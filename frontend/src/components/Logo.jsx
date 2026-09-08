import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

const SIZES = {
  sm: { box: "w-7 h-7", icon: 14, text: "text-base" },
  md: { box: "w-9 h-9", icon: 18, text: "text-xl" },
  lg: { box: "w-12 h-12", icon: 22, text: "text-2xl" },
};

/**
 * Brand logo — blue eye emblem + "MARG" wordmark.
 *
 * Props:
 *  - size: "sm" | "md" | "lg"        (default "md")
 *  - showText: boolean               show the "MARG" wordmark (default true)
 *  - light: boolean                  use white text, for dark backgrounds (default false)
 *  - to: string | null               route to link to, or null to render a plain <div>
 */
export default function Logo({
  size = "md",
  showText = true,
  light = false,
  to = "/",
  className = "",
}) {
  const s = SIZES[size] || SIZES.md;

  const content = (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`${s.box} rounded-full bg-blue-600 flex items-center justify-center shrink-0`}
      >
        <Eye className="text-white" size={s.icon} strokeWidth={2.5} />
      </div>

      {showText && (
        <span
          className={`${s.text} font-bold tracking-tight ${
            light ? "text-white" : "text-slate-900"
          }`}
        >
          MARG
        </span>
      )}
    </div>
  );

  if (!to) return content;

  return (
    <Link to={to} className="inline-flex">
      {content}
    </Link>
  );
}
