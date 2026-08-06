import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
function OtpInput({ value, onChange, length = 6, disabled, onComplete }) {
  const refs = useRef([]);
  useEffect(() => {
    refs.current[0]?.focus();
  }, []);
  useEffect(() => {
    if (value.length === length) onComplete?.(value);
  }, [value, length, onComplete]);
  const setDigit = (index, digit) => {
    const next = value.split("");
    next[index] = digit;
    onChange(next.join("").slice(0, length));
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
  };
  return <div className="flex justify-between gap-2 sm:gap-3" role="group" aria-label="One-time passcode">
      {Array.from({ length }).map((_, index) => <motion.input
    key={index}
    ref={(el) => {
      refs.current[index] = el;
    }}
    inputMode="numeric"
    autoComplete="one-time-code"
    aria-label={`Digit ${index + 1}`}
    maxLength={1}
    disabled={disabled}
    value={value[index] ?? ""}
    whileFocus={{ scale: 1.06 }}
    onChange={(event) => {
      const digit = event.target.value.replace(/\D/g, "").slice(-1);
      setDigit(index, digit);
    }}
    onKeyDown={(event) => {
      if (event.key === "Backspace") {
        event.preventDefault();
        if (value[index]) {
          setDigit(index, "");
        } else if (index > 0) {
          const next = value.split("");
          next[index - 1] = "";
          onChange(next.join(""));
          refs.current[index - 1]?.focus();
        }
      }
      if (event.key === "ArrowLeft") refs.current[index - 1]?.focus();
      if (event.key === "ArrowRight") refs.current[index + 1]?.focus();
    }}
    onPaste={(event) => {
      event.preventDefault();
      const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
      if (!pasted) return;
      onChange(pasted);
      refs.current[Math.min(pasted.length, length - 1)]?.focus();
    }}
    className={cn(
      "h-14 w-full rounded-2xl border border-border bg-card/70 text-center text-2xl font-semibold",
      "text-foreground caret-primary transition-all sm:h-16",
      "focus:border-primary/70 focus:outline-none focus:ring-4 focus:ring-primary/20",
      value[index] && "border-primary/60 shadow-glow"
    )}
  />)}
    </div>;
}
export {
  OtpInput
};
