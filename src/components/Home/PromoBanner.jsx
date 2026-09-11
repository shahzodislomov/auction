// components/PromoBanner.jsx
import React from "react";

const PromoBanner = () => (
  <div className="bg-blue-500 text-white py-4 px-6 rounded-md shadow-md text-center">
    <h2 className="text-lg font-bold">🎉 Special Winter Sale!</h2>
    <p className="mt-2">Get up to 50% off on premium accounts. Limited time offer!</p>
    <button className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded-md font-semibold hover:bg-yellow-300">
      Learn More
    </button>
  </div>
);

export default PromoBanner;
