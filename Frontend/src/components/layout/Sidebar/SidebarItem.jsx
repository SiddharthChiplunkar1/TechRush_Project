import { NavLink } from "react-router-dom";

const SidebarItem = ({
  icon: Icon,
  label,
  to,
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-300
        ${
          isActive
            ? "bg-orange-500 text-white shadow-lg"
            : "text-zinc-400 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      <Icon size={20} />

      <span>{label}</span>

    </NavLink>
  );
};

export default SidebarItem;