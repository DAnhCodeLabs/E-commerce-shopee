import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 ">
      <div className="spinner-nested-arc"></div>
    </div>
  );
};

export default Loader;
