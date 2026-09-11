"use client"
import { getStorageItem } from "@/utils/storage";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useReVerfMutation, useRegisterMutation, useVerfMutation } from "@/queries/index";
import CommonModal from "@/components/CommonModal";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { FormattedMessage, useIntl } from "react-intl";
import { Button } from "@mui/material";
import OTPInput from "@/components/OTPinput";
import GoogleLoginButton from "./GoogleLog";
import TelegramLoginButton from "./TelegramLog";
import {
  areRegistrationAgreementsAccepted,
  createAgreementAcceptanceDefaults,
} from "@/features/user-v2/agreements.mjs";
import { ArrowLeft } from "lucide-react";
import AgreementAcceptance from "@/components/user-v2/AgreementAcceptance";
import { formatUzPhone } from "@/lib/formatNumber";




// Custom hook for device ID
const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState(null);

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

  return deviceId;
};

const RegisterForm = () => {
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [open, setOpen] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [id, setId] = useState(null);
  // const [email, setEmail] = useState("");
  const email = watch("email");
  const password = watch("password");
  const reEnteredPassword = watch("reEnteredPassword");
  const intl = useIntl();
  const [acceptedAgreements, setAcceptedAgreements] = useState(
    createAgreementAcceptanceDefaults(false)
  );
  const [phone, setPhone] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  useEffect(() => {
    setPasswordsMatch(password && reEnteredPassword && password === reEnteredPassword);
  }, [password, reEnteredPassword]);

  const deviceId = useDeviceId();

  const { mutate: registerUser, isLoading } = useRegisterMutation(
    (response) => {
      if (response.status === "OK") {
        toast.success(response.message);
        setId(response.meta.userId);
        // setEmail(response.meta.email);
        setOpen(true);
      } else {
        toast.error(response.message);
      }
    },
    (error) => {
      toast.error("Registration failed. Please try again.");
      console.error(error);
    }
  );

  const { mutate: verifyCode } = useVerfMutation(
    (data) => {
      if (data.status === "BAD_REQUEST") {
        if (data.message === "CODE IS ERROR") {
          toast.error(data.message);
        } else {
          toast.info(data.message);
        }
      } else if (data.status === "OK") {
        toast.success(data.message);
        router.push("/");
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("userId", data.data.user.id);
      }
    },
    (error) => {
      toast.error("Code verification failed");
      console.error(error);
    }
  );

  useEffect(() => {
    if (open && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, open]);

  const onSubmit = async (data) => {
    if (!deviceId) {
      toast.error("Device ID not available.");
      return;
    }

    const { reEnteredPassword, ...registerData } = data;
    const payload = { ...registerData, deviceId };

    registerUser(payload);
  };

  const handleVerifyOTP = (otp) => {
    const verifyPayload = {
      id, // Ensure this is set when registering the user
      email: watch("email"), // Get from form
      phone: watch("phone"), // Get from form
      firstName: watch("firstname"), // Get from form
      lastName: watch("lastname"), // Get from form
      password: watch("password"), // Get from form
      code: otp, // OTP entered by the user
    };

    verifyCode(verifyPayload); // Call mutation to verify OTP
  };


  const onVerifyCodeSubmit = (data) => {
    const verifyPayload = {
      id,
      email: data.email,
      phone: watch("phone"), // Extract from form
      firstName: watch("firstname"), // Extract from form
      lastName: watch("lastname"), // Extract from form
      password: data.password,
      code: data.codeVerification,
    };

    verifyCode(verifyPayload);
  };

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


  const handleResendCode = () => {
    const email = watch("email").replace(/\s/g, "").trim();
    const userId = id
    resendCode({ email, userId });
  };



  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 loginCompo">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white rounded-lg shadow-lg px-6 py-4 space-y-4"
      >
               <span onClick={()=>router.back()} className=" cursor-pointer flex gap-2 font-bold"><ArrowLeft/>{intl.formatMessage({ id: "Back", defaultMessage: "Ortga" })}</span>
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          {intl.formatMessage({ id: "Register" })}
        </h2>

        <div className="flex gap-2">
          <div className="">
            <label>{intl.formatMessage({ id: "Firstname", defaultMessage: "Ism" })}</label>
            <input placeholder={intl.formatMessage({ id: 'enterFirstname' })}
            className="mt-1 block relative w-full p-2 border border-gray-300 rounded-md text-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            type="text" {...register("firstname", { required: true })} required />
          </div>
          <div className="">
            <label>{intl.formatMessage({ id: "Lastname", defaultMessage: "Familiya" })}</label>
            <input   className="mt-1 block relative w-full p-2 border border-gray-300 rounded-md text-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder={intl.formatMessage({ id: 'enterLastname' })} type="text" {...register("lastname", { required: true })} required />
          </div>
        </div>

        <div>
{errors.phone && (
    <p className="text-xs text-destructive">
        {errors.phone.message}
    </p>
)}
          <div className="relative">
        
            <input
              type="tel"
              placeholder="+998"
        className="mt-1 block relative w-full p-2 border border-gray-300 rounded-md text-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
               value={phone}
  {...register("phone", { required: true })}
   onChange={(e) => setPhone(formatUzPhone(e.target.value))}
              required
            />
            {/* Static country code label inside input */}
            {/* <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">+998</span> */}
          </div>
        </div>

        <div>
          <label>{intl.formatMessage({ id: "Email" })}</label>
          <input placeholder={intl.formatMessage({ id: 'Emailinput' })} type="email" {...register("email", { required: true })}   className="mt-1 block relative w-full p-2 border border-gray-300 rounded-md text-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div>
          <label>{intl.formatMessage({ id: "Password" })}</label>
          <div className="relative">
            <input
              placeholder={intl.formatMessage({ id: 'createpassword' })}
              type={isPasswordVisible ? "text" : "password"}
              {...register("password", {
                required: intl.formatMessage({ id: 'createpassword' }),
                minLength: {
                  value: 8,
                  message: intl.formatMessage({ id: 'createpasswordmessage' }),
                },
              })}   className="mt-1 block relative w-full p-2 border border-gray-300 rounded-md text-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="absolute inset-y-0 right-3 flex items-center cursor-pointer" onClick={() => setPasswordVisible(!isPasswordVisible)}>
              {isPasswordVisible ? <Visibility /> : <VisibilityOff />}
            </span>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
        <div className="relative">
          <input
            type={isPasswordVisible ? "text" : "password"}
            {...register("reEnteredPassword", {
              validate: (value) =>
                value === password || intl.formatMessage({ id: "Passwordsdontmatch" }),
            })}
            className="mt-1 block relative w-full p-2 border border-gray-300 rounded-md text-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={intl.formatMessage({ id: "Reenterpassword" })}
          />
          {passwordsMatch && reEnteredPassword && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-green-500 absolute right-4 top-1/2 -translate-y-1/2"
              width="24" height="24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {errors.reEnteredPassword && (
            <p className="text-red-500">{errors.reEnteredPassword.message}</p>
          )}
        </div>

        <AgreementAcceptance
          value={acceptedAgreements}
          onChange={setAcceptedAgreements}
          disabled={isLoading}
        />
        <Button type="submit"
          fullWidth
          variant="contained"
          color="primary"
          // className={`w-full p-2 text-white rounded ${isChecked ? "bg-primary " : "bg-gray-400 cursor-not-allowed"}`} 
          disabled={!areRegistrationAgreementsAccepted(acceptedAgreements) || isLoading}>
          {isLoading ? `${intl.formatMessage({ id: "Register" })}...` : intl.formatMessage({ id: "Register" })}
        </Button>
        <div style={{ display: "flex", alignItems: "center", marginTop: "16px", marginBottom: "0px" }}>
          <hr style={{ flex: 1, border: "none", height: "1px", backgroundColor: "#ccc" }} />
          <span style={{ margin: "0 10px", color: "#666", fontWeight: "bold" }}><FormattedMessage id='or' /></span>
          <hr style={{ flex: 1, border: "none", height: "1px", backgroundColor: "#ccc" }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 my-5">
          <GoogleLoginButton deviceId={deviceId} />
          <TelegramLoginButton deviceId={deviceId} />
        </div>
        
        {/* <GoogleLogin text="continue_with" useOneTap auto_select ux_mode="popup" /> */}

        <p className="text-center mt-5">
          {intl.formatMessage({ id: "Alreadyregistered" })}{" "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => router.push("/login")}
          >
            {intl.formatMessage({ id: "Login" })}
          </span>
        </p>
      </form>

      {open && (
        <CommonModal title={intl.formatMessage({ id: "Verify" })} onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit(onVerifyCodeSubmit)}>
            {/* <input type="text" {...register("codeVerification", { required: true })} required placeholder="Tasdqilash kodini kiriting" className="block w-full p-2 border rounded" /> */}
            <OTPInput onComplete={(otp) => handleVerifyOTP(otp)} />
            <div className="my-2">
              {canResend ? (
                <Button
                  color="primary"
                  disabled={isResendLoading}
                  type="button" onClick={handleResendCode}
                  className="text-primary hover:underline"
                >
                  {intl.formatMessage({ id: "Resendcode" })}
                </Button>
              ) : (
                <div>
                  {intl.formatMessage({ id: "Resendcode" })}:
                  <span> {timer} {intl.formatMessage({ id: "Seconds", defaultMessage: "Soniya" })}</span>
                </div>
              )}
            </div>
            <Button
              fullWidth
              variant="contained"
              color="success"
              disabled={isResendLoading}
              type="submit" className="w-full p-2 bg-green-500 text-white rounded">
              {intl.formatMessage({ id: "Verify" })}
            </Button>
          </form>
        </CommonModal>
      )}
    </div>
  );
};

export default RegisterForm;
