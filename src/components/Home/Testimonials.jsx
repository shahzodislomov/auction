// components/Testimonials.jsx
import React from "react";

const testimonials = [
  {
    name: "John Doe",
    feedback: "This platform is amazing! I've found great deals and had a smooth experience.",
    avatar: "https://via.placeholder.com/50",
  },
  {
    name: "Jane Smith",
    feedback: "Selling my account was quick and easy. Highly recommend this site!",
    avatar: "https://via.placeholder.com/50",
  },
];

const Testimonials = () => (
  <div className="bg-gray-100 p-6 rounded-md shadow-md">
    <h2 className="text-xl font-bold mb-4">What Our Users Say</h2>
    <div className="space-y-4">
      {testimonials.map((t, index) => (
        <div key={index} className="flex items-center space-x-4">
          <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full" />
          <div>
            <p className="font-semibold">{t.name}</p>
            <p className="text-sm text-gray-600">{t.feedback}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Testimonials;
