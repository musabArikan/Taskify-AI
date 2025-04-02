import React from "react";
import { Disclosure } from "@headlessui/react";
import { Link } from "react-router-dom";

const BaseNavbar = ({ children }) => {
  return (
    <Disclosure
      as="nav"
      className="bg-white sm:shadow-md border border-gray-200 "
    >
      <>
        <div className="mx-auto max-w-7xl sm:px-4 px-1">
          <div className=" flex h-16 items-center justify-between">
            <div className="flex flex-1 items-center sm:justify-start justify-center sm:items-stretch ">
              <Link
                to="/me"
                className="sm:text-2xl text-xl  relative font-bold flex justify-center items-center text-blue-600"
              >
                <span>Taskify AI</span>
                <div className="flex  absolute items-end right-[-58px] top-[-43px] sm:right-[-58px] sm:top-[-50px] justify-start pt-6 ">
                  <img
                    src="/logo.png"
                    alt=""
                    className="sm:w-[95px] sm:h-[95px]  w-[89px] h-[80px] "
                  />
                </div>
              </Link>
            </div>

            <div className="flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              {children}
            </div>
          </div>
        </div>
      </>
    </Disclosure>
  );
};

export default BaseNavbar;
