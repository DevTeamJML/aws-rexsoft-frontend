import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div className="layout">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={`main-container ${isCollapsed ? 'collapse-sidebar-main-container' : ""}`}>
        {children}
      </div>
    </div>
  );
}
