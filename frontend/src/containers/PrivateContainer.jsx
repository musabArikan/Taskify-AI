import React from "react";
import PrivateNavbar from "../components/private/PrivateNavbar";

const PrivateContainer = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#ffffff]">
      <PrivateNavbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl flex justify-center">
        {children}
      </div>
    </div>
  );
};

export default PrivateContainer;
