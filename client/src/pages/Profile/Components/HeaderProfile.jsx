import React from "react";
import { Divider } from "antd";
const HeaderProfile = ({heading, subHeading}) => {
  return (
    <>
      <div className="flex flex-col justify-center items-start gap-1">
        <h1 className="text-lg font-medium text-gray-800">{heading}</h1>
        <p className="text-sm text-gray-500">
          {subHeading}
        </p>
      </div>
      <Divider />
    </>
  );
};

export default HeaderProfile;
