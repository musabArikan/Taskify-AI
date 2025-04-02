import React, { useCallback, useState } from "react";
import TextBox from "devextreme-react/text-box";
import { Button } from "devextreme-react/button";
import { Link, useNavigate } from "react-router-dom";
import taskifyAi from "../../../API/taskifyAi";
import { TokenService } from "../../../API/taskifyAi";
import Swal from "sweetalert2";
const SignupComponent = () => {
  const navigate = useNavigate();
  const [nameValue, setNameValue] = useState("");
  const [surnameValue, setSurnameValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordMode, setPasswordMode] = useState("password");

  const handleNameChange = useCallback((e) => {
    setNameValue(e.value);
  }, []);
  const handleSurnameChange = useCallback((e) => {
    setSurnameValue(e.value);
  }, []);
  const handleEmailChange = useCallback((e) => {
    setEmailValue(e.value.replace(/\s/g, "").toLowerCase());
  }, []);
  const handlePasswordChange = useCallback((e) => {
    setPasswordValue(e.value);
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setPasswordMode((prevMode) => (prevMode === "text" ? "password" : "text"));
  }, []);

  const handleSignUp = useCallback(
    async (e) => {
      if (isSubmitting) return;

      try {
        setIsSubmitting(true);

        if (!nameValue || !surnameValue || !emailValue || !passwordValue) {
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

        const userData = {
          name: nameValue,
          surname: surnameValue,
          email: emailValue,
          password: passwordValue,
        };

        const response = await taskifyAi.signup(userData);

        if (response.success) {
          TokenService.setTokens(response.accessToken, response.refreshToken);

          Swal.fire({
            icon: "success",
            title: "Registration successful!",
            toast: true,
            position: "top-end",
            timer: 2100,
            showConfirmButton: false,
          });

          navigate("/me");
        } else {
          console.log("result mesage error:", response.message);
          Swal.fire({
            icon: "error",
            title: response.message || "Registration failed",
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
          title: error.message,
          toast: true,
          position: "top-end",
          timer: 2100,
          showConfirmButton: false,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [nameValue, surnameValue, emailValue, passwordValue, navigate, isSubmitting]
  );

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="bg-white p-8 rounded-lg border mt-[-20px] sm:mt-0 border-gray-200 shadow-lg w-full max-w-md  sm:!min-w-[400px] ">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Create an account
      </h1>

      <div className="space-y-5">
        <div>
          <TextBox
            showClearButton={true}
            value={nameValue}
            onValueChanged={handleNameChange}
            valueChangeEvent="keyup"
            width="100%"
            height={45}
            className="!text-lg !font-[500] !px-2"
            label="Name*"
            labelMode="floating"
          />
        </div>

        <div>
          <TextBox
            showClearButton={true}
            value={surnameValue}
            onValueChanged={handleSurnameChange}
            valueChangeEvent="keyup"
            width="100%"
            height={45}
            className="!text-lg !font-[500] !px-2"
            label="Surname*"
            labelMode="floating"
          />
        </div>

        <div>
          <TextBox
            showClearButton={true}
            value={emailValue}
            onValueChanged={handleEmailChange}
            valueChangeEvent="keyup"
            width="100%"
            height={45}
            className="!text-lg !font-[500] !px-2"
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
            height={45}
            className="!text-lg !font-[500] !px-2"
            label="Password*"
            labelMode="floating"
          />
          <button
            type="button"
            className="absolute right-4 top-3 !text-blue-500 hover:!text-blue-600"
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
          text={isSubmitting ? "Signing up..." : "Sign up"}
          onClick={handleSignUp}
          disabled={isSubmitting || !isValidEmail(emailValue)}
          height={45}
          width="100%"
          className="!bg-blue-500 hover:!bg-blue-600 !text-white !font-[500] !text-lg py-2 px-4"
        />
      </div>

      <div className="mt-6 text-center text-lg font-[600]">
        <span className="text-gray-600">Already have an account? </span>
        <Link to="/login" className="text-blue-500 hover:text-blue-700">
          Log in
        </Link>
      </div>
    </div>
  );
};

export default SignupComponent;
