import { useSelectUser } from "@/redux/slices/authSlice";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";

export const PageHeader = ({ title, headerContent }) => {
  const location = usePathname();
  const router = useRouter();
  const user = useSelectUser();

  return (
    <div className="page-header-container">
      {/* <div className="user-name">
        <div className="user-icon">
          <FaUser />
        </div>
        <span>
          Hi,{" "}
          {user &&
            `${user?.display_name} ${
              user?.role === "admin"
                ? `(${user?.user_id?.slice(-5).toUpperCase()})`
                : ""
            }`}
        </span>{" "}
      </div> */}
      <span className="h3 page-header-title">
        Good Morning, Test
      </span>
    </div>
  );
};
