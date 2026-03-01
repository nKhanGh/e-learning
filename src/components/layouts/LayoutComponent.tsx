"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layouts/Header";
import Sidebar from "@/components/layouts/Sidebar";
import Footer from "./Footer";
import { usePathname } from "next/navigation";

const LayoutClient = () => {
  const [openSidebar, setOpenSidebar] = useState(false);

  const pathname = usePathname();
  const hideFooter = pathname.endsWith("/chat");

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      openSidebar ? "16rem" : "5rem"
    );
  }, [openSidebar]);

  return (
    <>
      <Header openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
      <Sidebar open={openSidebar} />
      {!hideFooter && <Footer openSidebar={openSidebar} />}
    </>
  );
}

export default LayoutClient;
