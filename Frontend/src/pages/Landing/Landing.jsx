import Hero from "../../components/landing/Hero/Hero";
import Features from "../../components/landing/Features/Features";
import Authentication from "../../components/landing/Authentication/Authentication";
import Architecture from "../../components/landing/Architecture/Architecture";
import FAQ from "../../components/landing/FAQ/FAQ";
import CTA from "../../components/landing/CTA/CTA";

const Landing = () => {
  return (
    <>
      <Hero />

      <Features />

      <Authentication />

      <Architecture />

      <FAQ />

      <CTA />
    </>
  );
};

export default Landing;