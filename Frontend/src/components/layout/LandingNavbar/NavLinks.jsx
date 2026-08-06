import { navbarLinks } from "./navbarLinks";

const NavLinks = () => {
  return (
    <ul className="hidden lg:flex items-center gap-10">

      {navbarLinks.map((item) => (

        <li key={item.title}>

          <a
            href={item.href}
            className="text-zinc-300 transition hover:text-orange-500"
          >
            {item.title}
          </a>

        </li>

      ))}

    </ul>
  );
};

export default NavLinks;