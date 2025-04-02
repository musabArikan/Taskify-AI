import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "@headlessui/react";
import { TokenService } from "../../API/taskifyAi";

import BaseNavbar from "../public/BaseNavbar";
import { GrLogout } from "react-icons/gr";
import Swal from "sweetalert2";
const PrivateNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    TokenService.clearTokens();

    Swal.fire({
      icon: "success",
      title: "Logged out successfully!",
      toast: true,
      position: "top-end",
      timer: 2100,
      showConfirmButton: false,
    });
    navigate("/login");
  };

  return (
    <BaseNavbar>
      <Menu as="div" className=" ml-3 ">
        <button
          onClick={handleLogout}
          className={
            "block w-full cursor-pointer sm:px-4 sm:py-2 text-left text-sm text-gray-700"
          }
        >
          <GrLogout className="sm:text-[26px] text-[20px]" />
        </button>
      </Menu>
    </BaseNavbar>
  );
};

export default PrivateNavbar;
