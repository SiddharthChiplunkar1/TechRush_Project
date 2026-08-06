import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/DashboardNavbar/DashboardNavbar";
import Sidebar from "../components/layout/Sidebar/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-(--color-bg)">

      <Sidebar />

      <div className="flex flex-1 flex-col">

        <Navbar />

        <main className="flex-1 p-8">

          <Outlet />

        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;