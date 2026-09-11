import React, { useState, useRef } from "react";

const OTPInput = ({ length = 5, onComplete, disabled = false }) => {
    const [otp, setOtp] = useState(new Array(length).fill(""));
    const inputRefs = useRef([]);

    // Handle input change
    const handleChange = (e, index) => {
        const { value } = e.target;
        if (disabled) return;
        if (!/^\d*$/.test(value)) return; // Allow only numbers

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Take only last digit
        setOtp(newOtp);

        // Move to the next input
        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Call onComplete when all fields are filled
        if (newOtp.join("").length === length) {
            onComplete(newOtp.join(""));
        }
    };

    // Handle Backspace
    const handleKeyDown = (e, index) => {
        if (disabled) return;
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle Paste
    const handlePaste = (e) => {
        if (disabled) return;
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();
        if (!/^\d+$/.test(pastedData)) return; // Ensure only numbers

        const newOtp = pastedData.slice(0, length).split(""); // Limit to 5 characters
        setOtp(newOtp);

        // Move cursor to the last filled box
        const nextIndex = newOtp.length < length ? newOtp.length : length - 1;
        inputRefs.current[nextIndex]?.focus();

        // Call onComplete if fully filled
        if (newOtp.length === length) {
            onComplete(newOtp.join(""));
        }
    };

    return (
        <div className="flex space-x-2 justify-evenly">
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    aria-label={`OTP digit ${index + 1}`}
                    disabled={disabled}
                    maxLength={1}
                    className="w-10 h-10 text-center border border-gray-300 rounded-md text-lg"
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                />
            ))}
        </div>
    );
};

export default OTPInput;
