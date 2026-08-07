import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
function FeatureCard({
  icon: Icon,
  title,
  description,
  index = 0,
  className
}) {
  return <motion.article
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.5, delay: index * 0.07 }}
    whileHover={{ y: -8 }}
    className={cn(
      "glass-panel gradient-border group relative overflow-hidden rounded-3xl p-6",
      "transition-shadow duration-300 hover:shadow-glow",
      className
    )}
  >
      <div className="absolute -right-10 -top-10 size-28 rounded-full bg-primary/20 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-lift">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-5 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </motion.article>;
}
export {
  FeatureCard
};
