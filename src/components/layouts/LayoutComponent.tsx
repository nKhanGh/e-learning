"use client";

import { useState } from "react";
import Header from "@/components/layouts/Header";
import Sidebar from "@/components/layouts/Sidebar";
import Footer from "./Footer";

const LayoutClient = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [openSidebar, setOpenSidebar] = useState(false);

  return (
    <>
      <Header openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
      <Sidebar open={openSidebar} />
      <div className={`transition-all duration-300 ${openSidebar ? 'ml-64' : 'ml-20'} p-6 dark:bg-bg bg-white`}>
        {children}
      </div>
      <Footer openSidebar={openSidebar} />
    </>
  );
}

export default LayoutClient;
