"use client"
import { getStorageItem } from "@/utils/storage";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CommonModal from "@/components/CommonModal";
import {
  useLoginMutation,
  useVerfMutation,
  useReVerfMutation,
  useCheckCodeMutation,
} from "@/queries/index";
import { FormattedMessage, useIntl } from "react-intl";
import { Button } from "@mui/material";
import OTPInput from "@/components/OTPinput";
import { sendFcmToken } from "@/queries/notifications";
import { GoogleLogin } from "@react-oauth/google";
import { useUserContext } from "@/context/UserContext";
import GoogleLoginButton from "./GoogleLog";
import TelegramLoginButton from "./TelegramLog";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

const SignIn = () => {
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [open, setOpen] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [id, setId] = useState(null);
  const intl = useIntl();
  const { login } = useUserContext();
  const [showPassword, setShowPassword] = useState(false);
  // const useCheckCode = useCheckCodeMutation()

  // Retrieve or generate device ID
  useEffect(() => {
    const storedDeviceId = getStorageItem("deviceId");
    if (!storedDeviceId) {
      const newDeviceId = `device-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("deviceId", newDeviceId);
      setDeviceId(newDeviceId);
    } else {
      setDeviceId(storedDeviceId);
    }
  }, []);

  // Timer for resend
  useEffect(() => {
    if (open && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, open]);

  // Login Mutation
  const { mutate: userLogin, isLoading: isLoginLoading } = useLoginMutation(
    (responseData) => {
      if (responseData.code === 0) { // New device, verification code sent
        toast.success("Emailga tasdqilash kodi yuborildi");
        setOpen(true); // Open the verification modal
        setId(responseData.data); // Store the user ID for later verification
      } else if (responseData.code === 1) { // Login successful
        toast.success("Tasdiqlandi");
        localStorage.setItem("userId", responseData.data); // Save the user ID
        login(responseData.message);
        router.push("/"); // Redirect to the homepage or dashboard
        const storedToken = getStorageItem("fcmToken");
        if (storedToken) {
          sendFcmToken(storedToken, responseData.data);
          // toast.info(`token set: ${responseData.data}, ${storedToken}`)
        }
      } else if (responseData.status === "BAD_REQUEST") {
        toast.error("Email yoki parol xato!")
      } else {
        toast.error(responseData.message || "Xatolik yuz berdi, qayta urining");
      }
    },
    (error) => {
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
    }
  );



  // Verification Mutation
  const { mutate: verify } = useCheckCodeMutation(
    (responseData) => {
      if (responseData.message === "SUCCESS") {
        toast.success(responseData.message);
        login(responseData.data.token);
        localStorage.setItem("userId", id);
        router.push("/");
        const storedToken = getStorageItem("fcmToken");
        if (storedToken) {
          sendFcmToken(storedToken, id);
          // toast.info(`token set: ${id}, ${storedToken}`)
        }
      } else if (responseData.status === "BAD_REQUEST") {
        toast.error(responseData.message);
      }
    },
    (error) => {
      toast.error(error.response?.data?.message || "Verification failed.");
    }
  );

  // Resend Verification Code Mutation
  const { mutate: resendCode, isLoading: isResendLoading } = useReVerfMutation(
    (response) => {
      toast.info(response.message);
      setTimer(60);
      setCanResend(false);
    },
    (error) => {
      toast.error(error.response?.data?.message || "Failed to resend code.");
    }
  );

  // Handle Login Submission
  const onSubmit = (data) => {
    if (!deviceId) {
      toast.error("Device ID not available.");
      return;
    }
    const payload = { email: data.email, password: data.password, deviceId };
    userLogin(payload);
  };

  const handleVerifyOTP = (otp) => {
    if (!id || !deviceId) {
      toast.error("Missing user ID or device ID");
      return;
    }

    const payload = {
      id,           // User ID from login
      email: watch("email"),
      code: otp,    // OTP entered by the user
      deviceId,     // Device identifier
    };

    verify(payload); // Call mutation to verify OTP
  };


  // Handle Verification Submission
  const onVerfSubmit = (data) => {
    const payload = {
      id,
      email: data.email,
      code: data.codeVerification,
      deviceId // Include deviceId in the payload
    };
    verify(payload);
  };

  // Handle Resend Code
  const handleResendCode = () => {
    const email = watch("email").replace("+998", "").replace(/\s/g, "").trim();
    const userId = id
    resendCode({ email, userId });
  };

  return (
    <div className="flex justify-center items-center min-h-screen relative overflow-hidden loginCompo" >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6 space-y-4 relative z-10"
      >
        <span onClick={()=>router.back()} className=" cursor-pointer flex gap-2 font-bold"><ArrowLeft/>{intl.formatMessage({ id: "Back", defaultMessage: "Ortga" })}</span>
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          <FormattedMessage id="Login" />
        </h2>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <FormattedMessage id="Email" />
          </label>
          <input
            type="email"
            {...register("email", {
              required: intl.formatMessage({ id: "Emailreq" }),
            })}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={intl.formatMessage({ id: "Emailinput" })}
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <FormattedMessage id="Password" />
          </label>
          <input
             type={showPassword ? "text" : "password"}
            {...register("password", {
              required: intl.formatMessage({ id: "Passwordreq" }),
            })}
            className="mt-1 block relative w-full p-2 border border-gray-300 rounded-md text-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={intl.formatMessage({ id: "Passwordinput" })}
          />
             <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      className="absolute  inset-y-0 right-9  flex items-center text-gray-500 hover:text-gray-700"
    >
      {showPassword ? (
        <EyeOff size={20} />
      ) : (
        <Eye size={20} />
      )}
    </button>
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          // className="w-full py-2 px-4 bg-primary text-white font-medium rounded-md hover:bg-primary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          disabled={isLoginLoading}
        >
          <FormattedMessage id="Login" />
          {isLoginLoading && " ..."}
        </Button>
        <div style={{ display: "flex", alignItems: "center", marginTop: "16px", marginBottom: "0px" }}>
          <hr style={{ flex: 1, border: "none", height: "1px", backgroundColor: "#ccc" }} />
          <span style={{ margin: "0 12px", color: "#666", fontWeight: "bold" }}><FormattedMessage id='or' /></span>
          <hr style={{ flex: 1, border: "none", height: "1px", backgroundColor: "#ccc" }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 w-full my-5">
          <GoogleLoginButton deviceId={deviceId} />
          <TelegramLoginButton deviceId={deviceId} />
        </div>

        {/* Forgot password */}
        <p className="mt-5 text-sm text-center text-gray-600">
          <FormattedMessage id="ForgotPassword" defaultMessage="Parolni unutdingizmi" />{" "}
          <Link href="/forgot-password" className="text-blue-500 hover:underline">
            <FormattedMessage id="Reset" defaultMessage="Qayta tiklash" />
          </Link>
        </p>

        {/* Registration Link */}
        <p className="mt-4 text-sm text-center text-gray-600">
          <FormattedMessage id="Notregistered" />{" "}
          <Link href="/register" className="text-blue-500 hover:underline">
            <FormattedMessage id="Register" />
          </Link>
        </p>
      </form>

      {open && (
        <CommonModal title={intl.formatMessage({ id: "Verify" })} onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit(onVerfSubmit)}>
            <div className="my-4">
              {/* <input
                {...register("codeVerification", {
                  required: intl.formatMessage({ id: "Verifyreq" }),
                })}
                type="number"
                max={99999}
                onInput={(e) => {
                  if (e.target.value.length > 5) e.target.value = e.target.value.slice(0, 5);
                }}
                className="block w-full p-2 border border-gray-300 rounded-md text-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={intl.formatMessage({ id: "Verifyinput" })}
              /> */}
              <OTPInput onComplete={(otp) => handleVerifyOTP(otp)} />
            </div>

            <div className="flex justify-between items-center my-4">
              {canResend ? (
                <Button
                  type="button"
                  onClick={handleResendCode}
                  className="text-blue-500 hover:underline"
                  disabled={isResendLoading}
                >
                  <FormattedMessage id="Resendcode" />
                </Button>
              ) : (
                <span className="text-gray-500">
                  <FormattedMessage id="Resendcode" />: {timer}
                </span>
              )}
            </div>

            <Button
              type="submit"
              disabled={isResendLoading}
              variant="contained"
              color="success"
              fullWidth
            // className="w-full py-2 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <FormattedMessage id="Verify" />
            </Button>
          </form>
        </CommonModal>
      )}
    </div>
  );
};

export default SignIn;
