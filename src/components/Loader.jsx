import React from "react";

function Loader() {

  return (
    <div className="fixed grid place-content-center inset-0 bg-black/50 backdrop-blur-sm h-screen w-screen z-[99999]">
      <div className="h-12 w-12 bg-transparent border-2 border-primary border-t-0 border-r-0 animate-spin rounded-full" />
    </div>
  );
}

export default Loader;
