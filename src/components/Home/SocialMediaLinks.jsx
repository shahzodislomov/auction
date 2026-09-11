// components/SocialMediaLinks.jsx
import React from "react";

const SocialMediaLinks = () => (
  <div className="text-center space-x-4">
    <a
      href="https://facebook.com"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800"
    >
      Facebook
    </a>
    <a
      href="https://twitter.com"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:text-blue-600"
    >
      Twitter
    </a>
    <a
      href="https://instagram.com"
      target="_blank"
      rel="noopener noreferrer"
      className="text-pink-600 hover:text-pink-800"
    >
      Instagram
    </a>
    <a
      href="https://linkedin.com"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-700 hover:text-blue-900"
    >
      LinkedIn
    </a>
  </div>
);

export default SocialMediaLinks;
