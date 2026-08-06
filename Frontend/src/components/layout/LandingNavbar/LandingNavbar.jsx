import { useEffect, useState } from "react";

import Logo from "./Logo";
import NavLinks from "./NavLinks";
import CTAButtons from "./CTAButtons";
import MobileMenu from "./MobileMenu";

const Navbar = () => {

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {

    const handleScroll = () => {

      setScrolled(window.scrollY > 20);

    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);

  return (

    <header className="fixed top-5 left-0 right-0 z-50">

      <div className="page-container">

        <nav
          className={`
          flex items-center justify-between
          rounded-full
          px-8
          py-4
          transition-all
          duration-300

          ${
            scrolled
              ? "glass shadow-2xl"
              : "bg-transparent"
          }
          `}
        >

          <Logo />

          <NavLinks />

          <CTAButtons />

          <MobileMenu />

        </nav>

      </div>

    </header>

  );

};

export default Navbar;