import FeatureCard from "./FeatureCard";
import { featureData } from "./featureData";

const Features = () => {
  return (
    <section
      id="features"
      className="page-container py-28"
    >
      <div className="mb-16 text-center">

        <p className="mb-4 text-orange-500">

          WHY TECHRUSH

        </p>

        <h2 className="text-5xl font-bold">

          Enterprise Passwordless Banking

        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-zinc-400">

          Built with modern authentication methods,
          intelligent fraud detection,
          secure microservices,
          and enterprise-grade architecture.

        </p>

      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

        {featureData.map((feature) => (

          <FeatureCard
            key={feature.title}
            feature={feature}
          />

        ))}

      </div>
    </section>
  );
};

export default Features;