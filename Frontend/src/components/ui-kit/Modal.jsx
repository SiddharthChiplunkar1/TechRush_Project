import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
function Modal({ open, onClose, title, description, children, footer }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return <AnimatePresence>
      {open && <motion.div
    className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
          <button
    aria-label="Close dialog"
    onClick={onClose}
    className="absolute inset-0 bg-background/70 backdrop-blur-md"
  />
          <motion.div
    role="dialog"
    aria-modal="true"
    aria-label={title}
    initial={{ opacity: 0, y: 28, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 18, scale: 0.98 }}
    transition={{ type: "spring", stiffness: 320, damping: 28 }}
    className="glass-panel relative z-10 w-full max-w-lg rounded-3xl p-6"
  >
            <button
    onClick={onClose}
    aria-label="Close"
    className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
  >
              <X className="size-4" />
            </button>
            {title && <h3 className="pr-10 text-lg font-semibold text-foreground">{title}</h3>}
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            {children && <div className="mt-5">{children}</div>}
            {footer && <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>}
          </motion.div>
        </motion.div>}
    </AnimatePresence>;
}
export {
  Modal
};
