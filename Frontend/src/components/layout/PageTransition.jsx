import { AnimatePresence, motion } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";
function PageTransition({ children }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return <AnimatePresence mode="wait" initial={false}>
      <motion.div
    key={pathname}
    initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
  >
        {children}
      </motion.div>
    </AnimatePresence>;
}
export {
  PageTransition
};
