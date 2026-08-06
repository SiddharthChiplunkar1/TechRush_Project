import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
const Input = forwardRef(function Input2({ className, label, hint, error, icon, id, ...props }, ref) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return <div className="space-y-2">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
          {label}
        </label>}
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>}
        <input
    ref={ref}
    id={inputId}
    aria-invalid={Boolean(error)}
    className={cn(
      "h-12 w-full rounded-2xl border border-border bg-card/70 px-4 text-sm text-foreground",
      "placeholder:text-muted-foreground/70 transition-all",
      "focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/15",
      icon && "pl-11",
      error && "border-destructive/70 focus:ring-destructive/20",
      className
    )}
    {...props}
  />
      </div>
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>;
});
export {
  Input
};
