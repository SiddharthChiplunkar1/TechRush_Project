import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
const tips = [
  "Face ID unlocks in under two seconds and never leaves your device unencrypted.",
  "Trusted devices are bound to a rotating fingerprint \u2014 stolen tokens alone are useless.",
  "Email OTPs expire in 60 seconds and are single-use by design.",
  "Review your login history weekly and revoke anything unfamiliar."
];
function SecurityTipsCarousel() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % tips.length), 5200);
    return () => window.clearInterval(id);
  }, []);
  return <div className="glass-panel relative overflow-hidden rounded-3xl p-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
        <Lightbulb className="size-4" />
        Security tip
      </div>
      <div className="relative mt-3 h-16">
        <AnimatePresence mode="wait">
          <motion.p
    key={index}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.4 }}
    className="text-sm leading-relaxed text-muted-foreground"
  >
            {tips[index]}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="mt-2 flex gap-1.5">
        {tips.map((tip, i) => <button
    key={tip}
    aria-label={`Show tip ${i + 1}`}
    onClick={() => setIndex(i)}
    className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-primary" : "w-3 bg-muted"}`}
  />)}
      </div>
    </div>;
}
export {
  SecurityTipsCarousel
};
