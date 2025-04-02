import React from "react";
import { Outlet } from "react-router-dom";
import BaseNavbar from "../components/public/BaseNavbar";

const PublicContainer = () => {
  return (
    <div className="min-h-screen w-full h-full bg-[#ffffff]">
      <BaseNavbar />
      <div className="flex items-center justify-center mt-20 sm:mt-10   md:gap-8">
        <Outlet />
        <div className="pb-10 ">
          <img
            src="/sign-background.jpeg"
            alt=""
            className="hidden md:inline-block  md:h-[470px] md:w-[410px] rounded-[19%] "
          />
        </div>
      </div>
    </div>
  );
};

export default PublicContainer;
