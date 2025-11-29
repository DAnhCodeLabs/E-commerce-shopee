import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import SideBar from "../components/SideBar";

const AdminPages = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="grid grid-cols-7">
        <div className="row-span-5 h-screen overflow-y-auto sticky top-0 sidebar">
          <SideBar />
        </div>
        <div className="col-span-6 sticky top-0 z-10">
          <Navbar />
        </div>
        <div className="col-span-6 col-start-2 row-start-2 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminPages;
