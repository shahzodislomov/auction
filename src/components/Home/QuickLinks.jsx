// components/QuickLinks.jsx
import React from "react";
import Link from "next/link";

const QuickLinks = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
    <Link
      href="/my-lots"
      className="bg-gray-200 py-4 rounded-md shadow hover:bg-gray-300 font-medium"
    >
      My Lots
    </Link>
    <Link
      href="/help"
      className="bg-gray-200 py-4 rounded-md shadow hover:bg-gray-300 font-medium"
    >
      Help Center
    </Link>
    <Link
      href="/sell"
      className="bg-gray-200 py-4 rounded-md shadow hover:bg-gray-300 font-medium"
    >
      Sell a Lot
    </Link>
    <Link
      href="/contact"
      className="bg-gray-200 py-4 rounded-md shadow hover:bg-gray-300 font-medium"
    >
      Contact Us
    </Link>
  </div>
);

export default QuickLinks;
