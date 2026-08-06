import { motion } from "framer-motion";
import GlassCard from "../../common/GlassCard/GlassCard";

const FeatureCard = ({ feature }) => {
  const Icon = feature.icon;

  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      transition={{ duration: 0.25 }}
    >
      <GlassCard className="group h-full cursor-pointer p-6">

        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 transition-all duration-300 group-hover:bg-orange-500">

          <Icon
            size={30}
            className="text-orange-500 group-hover:text-white"
          />

        </div>

        <h3 className="mb-4 text-xl font-semibold">

          {feature.title}

        </h3>

        <p className="leading-7 text-zinc-400">

          {feature.description}

        </p>

      </GlassCard>
    </motion.div>
  );
};

export default FeatureCard;