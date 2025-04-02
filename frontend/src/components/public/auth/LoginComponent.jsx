import React, { useCallback, useState } from "react";
import TextBox from "devextreme-react/text-box";
import { Button } from "devextreme-react/button";
import { Link, useNavigate } from "react-router-dom";
import taskifyAi from "../../../API/taskifyAi";
import Swal from "sweetalert2";
const LoginComponent = () => {
  const navigate = useNavigate();
  const [emailValue, setEmailValue] = useState("tester@tester.com");
  const [passwordValue, setPasswordValue] = useState("tester");
  const [loading, setLoading] = useState(false);
  const [passwordMode, setPasswordMode] = useState("password");

  const handleEmailChange = useCallback((e) => {
    setEmailValue(e.value.replace(/\s/g, "").toLowerCase());
  }, []);

  const handlePasswordChange = useCallback((e) => {
    setPasswordValue(e.value);
  }, []);

  const togglePasswordVisibility = useCallback((e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    setPasswordMode((prevMode) => (prevMode === "text" ? "password" : "text"));
  }, []);

  const handleLogin = useCallback(
    async (e) => {
      if (loading) return;

      try {
        setLoading(true);

        if (!emailValue || !passwordValue) {
          Swal.fire({
            icon: "warning",
            title: "Please fill in all fields!",
            toast: true,
            position: "top-end",
            timer: 2100,
            showConfirmButton: false,
          });
          return;
        }

        const response = await taskifyAi.login(emailValue, passwordValue);

        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "Logged in successfully!",
            toast: true,
            position: "top-end",
            timer: 2100,
            showConfirmButton: false,
          });

          navigate("/me");
        } else {
          console.log(response.message);
          Swal.fire({
            icon: "error",
            title: response.message || "Log in failed!",
            toast: true,
            position: "top-end",
            timer: 2100,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: error.message || "Connection error occurred!",
          toast: true,
          position: "top-end",
          timer: 2100,
          showConfirmButton: false,
        });
      } finally {
        setLoading(false);
      }
    },
    [emailValue, passwordValue, navigate, loading]
  );

  return (
    <div className="w-full flex items-center justify-center  ">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md border-none sm:border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Welcome back
        </h1>

        <div className="space-y-6">
          <div>
            <TextBox
              showClearButton={true}
              value={emailValue}
              onValueChanged={handleEmailChange}
              valueChangeEvent="keyup"
              width="100%"
              height={55}
              className="!text-lg !font-[500] !px-2 "
              label="Email*"
              labelMode="floating"
            />
          </div>

          <div className="relative">
            <TextBox
              mode={passwordMode}
              value={passwordValue}
              onValueChanged={handlePasswordChange}
              width="100%"
              height={55}
              className="!text-lg !font-[500]  !px-2 "
              label="Password*"
              labelMode="floating"
            />
            <button
              type="button"
              className="absolute right-4 top-4 !text-blue-500  hover:!text-blue-600"
              onClick={togglePasswordVisibility}
              tabIndex="-1"
            >
              <i
                className={` text-xl fa ${
                  passwordMode === "text" ? "bi-eye-slash" : "bi-eye"
                }`}
              ></i>
            </button>
          </div>

          <Button
            text={loading ? "Logging in..." : "Log in"}
            onClick={handleLogin}
            disabled={loading}
            height={50}
            width="100%"
            className="!bg-blue-500  hover:!bg-blue-600 !text-white !font-[500] !text-xl py-2 px-4 "
          />
        </div>

        <div className="mt-6 text-center text-lg font-[600]">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/signup" className="text-blue-500  hover:text-blue-700">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
