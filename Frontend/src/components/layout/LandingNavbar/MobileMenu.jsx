import { Menu, X } from "lucide-react";
import { useState } from "react";
import { navLinks } from "./navLinks";

const MobileMenu = () => {

  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden"
      >
        {open ? <X /> : <Menu />}
      </button>

      {open && (

        <div className="absolute left-0 top-20 w-full border-t border-white/10 bg-black/95 backdrop-blur-xl">

          <div className="flex flex-col p-6">

            {navLinks.map((item) => (

              <a
                key={item.title}
                href={item.href}
                className="py-4 text-zinc-300"
              >
                {item.title}
              </a>

            ))}

          </div>

        </div>

      )}

    </>
  );
};

export default MobileMenu;