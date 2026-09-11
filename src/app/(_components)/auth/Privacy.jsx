import { ArrowBack } from "@mui/icons-material";
import React from "react";
import Link from "next/link";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex items-center my-3">
        <Link className="mr-4 text-primary" href="/register"><ArrowBack/></Link>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
      </div>
      <p className="mb-4">
        Welcome to Auction. Your privacy is important to us. This Privacy Policy explains how we
        collect, use, disclose, and safeguard your information when you visit our website.
      </p>

      <h2 className="text-2xl font-semibold mt-4">Information We Collect</h2>
      <p className="mb-4">
        We may collect personal information such as your name, email address, phone number, and other details
        when you register on our site, make a purchase, or interact with our services.
      </p>

      <h2 className="text-2xl font-semibold mt-4">How We Use Your Information</h2>
      <p className="mb-4">
        We use your information to provide and improve our services, process transactions, and communicate
        with you about updates, promotions, and security alerts.
      </p>

      <h2 className="text-2xl font-semibold mt-4">Sharing Your Information</h2>
      <p className="mb-4">
        We do not sell or trade your personal data. However, we may share your information with
        third-party services to facilitate our operations, comply with legal requirements, or protect our users.
      </p>

      <h2 className="text-2xl font-semibold mt-4">Security</h2>
      <p className="mb-4">
        We implement appropriate security measures to protect your personal information from unauthorized
        access, alteration, disclosure, or destruction.
      </p>

      <h2 className="text-2xl font-semibold mt-4">Changes to This Policy</h2>
      <p className="mb-4">
        We reserve the right to update this Privacy Policy at any time. We encourage you to review it periodically
        to stay informed about how we are protecting your information.
      </p>

      <h2 className="text-2xl font-semibold mt-4">Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us at support@efbazaar.com.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
