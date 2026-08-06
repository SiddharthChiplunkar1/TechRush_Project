import HeroBackground from "./HeroBackground";
import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";
import HeroStats from "./HeroStats";

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">

      <HeroBackground />

      <div className="page-container relative z-10">

        <div className="grid min-h-screen items-center gap-20 lg:grid-cols-2">

          <HeroContent />

          <HeroImage />

        </div>

        <HeroStats />

      </div>

    </section>
  );
};

export default Hero;