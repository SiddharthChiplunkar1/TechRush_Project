import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  Shield,
  Laptop,
  User,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

import SidebarItem from "./SidebarItem";

const Sidebar = () => {
  return (
    <aside className="w-70 border-r border-white/5 bg-black/30 backdrop-blur-xl">

      <div className="flex h-20 items-center px-8">

        <h1 className="text-2xl font-bold">

          Tech<span className="text-orange-500">Rush</span>

        </h1>

      </div>

      <nav className="space-y-3 p-5">

        <SidebarItem
          to="/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
        />

        <SidebarItem
          to="/transfer"
          icon={ArrowLeftRight}
          label="Transfer"
        />

        <SidebarItem
          to="/transactions"
          icon={Receipt}
          label="Transactions"
        />

        <SidebarItem
          to="/security"
          icon={Shield}
          label="Security"
        />

        <SidebarItem
          to="/devices"
          icon={Laptop}
          label="Devices"
        />

        <SidebarItem
          to="/profile"
          icon={User}
          label="Profile"
        />

        <SidebarItem
          to="/notifications"
          icon={Bell}
          label="Notifications"
        />

        <SidebarItem
          to="/settings"
          icon={Settings}
          label="Settings"
        />

      </nav>

      <div className="mt-auto p-5">

        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/20 py-3 text-red-400">

          <LogOut size={18} />

          Logout

        </button>

      </div>

    </aside>
  );
};

export default Sidebar;