import { motion } from "framer-motion";
function EmptyState({
  icon: Icon,
  title,
  description,
  action
}) {
  return <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    className="glass-panel flex flex-col items-center rounded-3xl px-6 py-14 text-center"
  >
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-5 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>;
}
export {
  EmptyState
};
