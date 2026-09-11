"use client"
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CommonModal from "@/components/CommonModal";
import { FormattedMessage, useIntl } from "react-intl";
import { useUpdatePassword, useUpdatePasswordVerify } from "@/queries/users";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@mui/material";
import OTPInput from "@/components/OTPinput";
import { ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({});
    const queryClient = useQueryClient();
    const intl = useIntl();
    const updatePassword = useUpdatePassword();
    const updatePasswordVerify = useUpdatePasswordVerify();
    const [step, setStep] = useState(1)
    const [error, setError] = useState({})

    const errorMessages = {
        "uz": {
            "PASSWORD MUST BE AT LEAST 8 CHARACTERS": "Parol kamida 8 ta belgidan iborat bo'lishi kerak",
            "CODE IS ERROR": "Kiritilgan kod noto'g'ri",
            "USER NOT FOUND": "Foydalanuvchi topilmadi",
        },
        "en": {
            "PASSWORD MUST BE AT LEAST 8 CHARACTERS": "Password must be at least 8 characters long",
            "CODE IS ERROR": "Code is error",
            "USER NOT FOUND": "User not found",


        },
        "ru": {
            "PASSWORD MUST BE AT LEAST 8 CHARACTERS": "Пароль должен содержать не менее 8 символов",
            "CODE IS ERROR": "Введенный код неверный",
            "USER NOT FOUND": "Пользователь не найден",
        },
    }
    const getErrorText = (msg) => {
        return errorMessages[intl.locale]?.[msg] || errorMessages["uz"]?.[msg] || msg;
    };

    const handleSubmit = () => {
        setError("");
        updatePassword.mutate(
            { email: formData.email, newPassword: formData.newPassword },
            {
                onSuccess: (response) => {
                    if (response.data.status === "OK") {
                        toast.success("Kodni pochtangizga yubordik");
                        setStep(3);
                    } else {
                        setError(getErrorText(response.data.message));
                    }
                },
                onError: (err) => {
                    const msg = err.response?.data?.message || err.response?.data?.errorCode || "Xatolik yuz berdi!";
                    if (msg === "INTERNAL_ERROR" || msg.includes("unexpected")) {
                        setError("Siz Google orqali ro'yxatdan o'tgan bo'lishingiz mumkin. Bunday holda parol o'zgartirilmaydi.");
                    } else {
                        setError(getErrorText(msg));
                    }
                },
            }
        );
    };

    const onVerfSubmit = () => {
        setError("");
        updatePasswordVerify.mutate(
            { email: formData.email, password: formData.newPassword, code: formData.code },
            {
                onSuccess: (response) => {
                    if (response.data.status === "BAD_REQUEST") {
                        setError(getErrorText(response.data.message));
                    } else {
                        toast.success("Parol muvaffaqiyatli o'zgartirildi");
                        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
                        router.push('/login');
                    }
                },
                onError: (err) => {
                    const msg = err.response?.data?.message || "Xatolik yuz berdi!";
                    setError(getErrorText(msg));
                }
            }
        );
    };

    const handleChange = (e) => {
        setError("");
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 relative overflow-hidden loginCompo">
            <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6 space-y-4 relative z-10">
                <span onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="cursor-pointer flex gap-2 font-bold hover:text-gray-600 transition-colors">
                    <ArrowLeft />{intl.formatMessage({ id: "Back", defaultMessage: "Ortga" })}
                </span>

                <h2 className="text-2xl font-semibold text-center text-gray-800">
                    <FormattedMessage id="ResetPassword" defaultMessage="Parolni qayta tiklash" />
                </h2>
                
                {error && (
                    <div className="p-3 bg-red-100 text-red-600 text-sm font-medium rounded-md text-center">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                <FormattedMessage id="Email" />
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                onChange={handleChange}
                                value={formData.email || ""}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder={intl.formatMessage({ id: "Emailinput", defaultMessage: "Emailingizni kiriting" })}
                            />
                        </div>
                        <Button 
                            variant="contained" 
                            onClick={() => { if(formData.email) setStep(2) }}
                            disabled={!formData.email}
                            className="w-full py-2 px-4 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                            <FormattedMessage id="Next" defaultMessage="Keyingi" />
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                <FormattedMessage id="NewPassword" defaultMessage="Yangi parol" />
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                required
                                onChange={handleChange}
                                value={formData.newPassword || ""}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-black shadow-sm focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder={intl.formatMessage({ id: "NewPasswordinput", defaultMessage: "Yangi parolni kiriting" })}
                            />
                        </div>
                        <Button 
                            variant="contained" 
                            onClick={handleSubmit}
                            disabled={!formData.newPassword || updatePassword.isPending}
                            className="w-full py-2 px-4 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                            {updatePassword.isPending ? "..." : <FormattedMessage id="SendCode" defaultMessage="Kod jo'natish" />}
                        </Button>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 text-center">
                            <strong>{formData.email}</strong> manziliga tasdiqlash kodi yuborildi.
                        </p>
                        <div className="flex justify-center my-4">
                            <OTPInput onComplete={(otp) => setFormData({ ...formData, code: otp })} />
                        </div>
                        <Button 
                            variant="contained" 
                            onClick={onVerfSubmit} 
                            disabled={!formData.code || updatePasswordVerify.isPending}
                            className="w-full py-2 px-4 !bg-green-600 !text-white font-medium rounded-md hover:!bg-green-700 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            {updatePasswordVerify.isPending ? "..." : <FormattedMessage id="Verify" defaultMessage="Tasdiqlash" />}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
