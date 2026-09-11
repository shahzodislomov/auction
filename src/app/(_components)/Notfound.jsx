import React, { useState, useEffect } from "react";

function Notfound() {
  const [timeOut, setTimeOut] = useState(5);

  useEffect(() => {
    // Countdown timer
    const countdown = setInterval(() => {
      setTimeOut((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Redirect after 5 seconds
    const redirect = setTimeout(() => {
      window.location.href = "/";
    }, 5000);

    // Cleanup the interval and timeout on component unmount
    return () => {
      clearInterval(countdown);
      clearTimeout(redirect);
    };
  }, []);

  return (
    <div className="text-center">
      <h1 className="text-3xl text-center mt-20 font-bold">
        Requested resource not found
      </h1>
      <p>You'll be redirected in {timeOut} seconds...</p>
    </div>
  );
}

export default Notfound;
