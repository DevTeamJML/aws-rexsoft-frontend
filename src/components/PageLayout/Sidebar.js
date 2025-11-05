import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { logOut, useSelectUser } from "@/redux/slices/authSlice";
import {
  resetUnsavedState,
  setPendingPath,
  setShowModal,
  useSelectUnsavedChanges,
} from "@/redux/slices/confirmModalSlice";
import Image from "next/image";
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaAngleRight,
  FaTimes,
  FaChartLine,
  FaChartBar,
  FaUsers,
  FaFileAlt,
  FaSlidersH,
  FaThLarge,
} from "react-icons/fa";
import { ImHammer2 } from "react-icons/im";
import { useState } from "react";
import { useSelectCurrCompany } from "@/redux/slices/companySlice";

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();
  const user = useSelectUser();
  const unsavedChanges = useSelectUnsavedChanges();
  const currCompany = useSelectCurrCompany();

  const [activeMenu, setActiveMenu] = useState(null);
  const [showSubmenu, setShowSubmenu] = useState(false);

  const LogoutIcon = dynamic(
    () => import("@mui/icons-material/LogoutOutlined"),
    {
      ssr: false,
    }
  );

  const currentPath = router.pathname;

  // Menu configuration
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <FaThLarge size={20} />,
      path: "/dashboard", // Add path for direct navigation
    },
    {
      id: "graph",
      label: "Graph",
      icon: <FaChartLine size={20} />,
      subItems: [
        {
          id: "graph-client",
          label: "Graph Client",
          path: "/graph/graph-client",
        },
        {
          id: "graph-kpi",
          label: "KPI Graph",
          path: "/graph/graph-kpi",
        },
        {
          id: "graph-form",
          label: "Graph Form",
          path: "/graph/graph-form",
        },
      ],
    },
    {
      id: "kpi",
      label: "KPI",
      icon: <FaChartBar size={20} />,
      subItems: [
        {
          id: "kpi-list",
          label: "KPI List",
          path: "/kpi/kpi-list",
        },
        {
          id: "kpi-group",
          label: "KPI Group",
          path: "/kpi/kpi-group",
        },
      ],
    },
    {
      id: "client",
      label: "Client",
      icon: <FaUsers size={20} />,
      subItems: [
        {
          id: "client-list",
          label: "Client List",
          path: "/client/client-list",
        },
        {
          id: "manage-group",
          label: "Manage Group",
          path: "/client/client-group-list",
        },
      ],
    },
    {
      id: "form",
      label: "Form",
      icon: <FaFileAlt size={20} />,
      subItems: [
        {
          id: "form-template",
          label: "Form Template",
          path: "/form/form-template",
        },
        {
          id: "form-submission",
          label: "Form Submission",
          path: "/form/form-submission",
        },
        {
          id: "form-approval",
          label: "Form Approval",
          path: "/form/form-approval",
        },
        {
          id: "form-tracker",
          label: "Form Tracker",
          path: "/form/Tracker",
        },
      ],
    },
    {
      id: "appointment",
      label: "Appointment",
      icon: <FaCalendarAlt size={20} />,
      subItems: [
        {
          id: "calendar",
          label: "Calendar",
          path: "/appointment/calendar",
        },
        {
          id: "upcoming-appointment",
          label: "Upcoming Appointment",
          path: "/appointment/upcoming-appointment",
        },
      ],
    },
    {
      id: "control-panel",
      label: "Control Panel",
      icon: <FaSlidersH size={20} />,
      subItems: [
        {
          id: "users",
          label: "User",
          path: "/control-panel/user",
        },
        {
          id: "role",
          label: "Role",
          path: "/control-panel/role",
        },
        {
          id: "company-profile",
          label: "Company Profile",
          path: "/control-panel/company-profile",
        },
        {
          id: "create-company",
          label: "Create Company",
          path: "/control-panel/create-company",
        },
      ],
    },
  ];

  const handleGoToSelectedPage = (path) => {
    router.push(path);
    // Close submenu when navigating
    setShowSubmenu(false);
    setActiveMenu(null);
  };

  const handleSignOut = () => {
    dispatch(logOut({ router }));
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    // Close submenu when collapsing main sidebar
    if (!isCollapsed) {
      setShowSubmenu(false);
      setActiveMenu(null);
    }
  };

  const handleMenuClick = (menu) => {
    const hasSubItems = menu.subItems && menu.subItems.length > 0;

    if (hasSubItems) {
      // Toggle submenu on click
      if (activeMenu?.id === menu.id && showSubmenu) {
        // Clicking the same menu - close submenu
        setShowSubmenu(false);
        setActiveMenu(null);
      } else {
        // Clicking different menu - open submenu
        setActiveMenu(menu);
        setShowSubmenu(true);
      }
    } else if (menu.path) {
      // No subitems, navigate directly
      handleGoToSelectedPage(menu.path);
    }
  };

  const closeSubmenu = () => {
    setShowSubmenu(false);
    setActiveMenu(null);
  };

  const isMenuActive = (menu) => {
    if (menu.path && currentPath === menu.path) return true;

    if (menu.subItems) {
      return menu.subItems.some(
        (subItem) =>
          currentPath === subItem.path ||
          currentPath.startsWith(subItem.path + "/")
      );
    }

    return false;
  };

  const isSubItemActive = (subItem) => {
    return (
      currentPath === subItem.path || currentPath.startsWith(subItem.path + "/")
    );
  };

  const shouldShowMenuItem = (menu) => {
    if (menu.roles && user) {
      return menu.roles.includes(user.role);
    }
    return true;
  };

  return (
    <>
      {/* Backdrop for closing submenu when clicking outside */}
      {showSubmenu && (
        <div className="submenu-backdrop" onClick={closeSubmenu} />
      )}

      <div className={`sidebar-container ${isCollapsed ? "collapsed" : ""}`}>
        <div
          className={`sidebar-top-section ${
            !isCollapsed ? "top-section-justify-end" : ""
          }`}
        >
          {!isCollapsed ? (
            <div className="sidebar-header">
              {/* <Image
                className="logo"
                src="/assets/favicon.ico"
                alt="Logo"
                style={{ objectFit: "contain" }}
                width={150}
                height={50}
                priority
              /> */}
              <span className="">{currCompany?.company_name || null}</span>
            </div>
          ) : // <Image
          //   className="logo"
          //   src="/assets/favicon.ico"
          //   alt="Logo"
          //   style={{ objectFit: "contain" }}
          //   width={200}
          //   height={30}
          //   priority
          // />
          null}
          <div
            className="toggle-button"
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar();
            }}
          >
            {isCollapsed ? (
              <FaChevronRight size={15} />
            ) : (
              <FaChevronLeft size={15} />
            )}
          </div>
        </div>

        <div className="sidebar-bottom-section">
          <div className="mid-section">
            {menuItems.map((menu) => {
              if (!shouldShowMenuItem(menu)) return null;

              const isActive = isMenuActive(menu);
              const hasSubItems = menu.subItems && menu.subItems.length > 0;

              return (
                <div key={menu.id} className="menu-group">
                  <div
                    className={`sidebar-section menu-item ${
                      isActive ? "selected-sidebar-section" : ""
                    } ${hasSubItems ? "has-submenu" : ""} ${
                      activeMenu?.id === menu.id && showSubmenu
                        ? "active-menu"
                        : ""
                    }`}
                    onClick={() => handleMenuClick(menu)}
                  >
                    <div className="menu-item-content">
                      <div className="icon">{menu.icon}</div>
                      {!isCollapsed && (
                        <>
                          <span className="menu-label">{menu.label}</span>
                          {/* Only show arrow for items with submenus */}
                          {hasSubItems && (
                            <div className="submenu-arrow">
                              <FaAngleRight size={14} />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bottom-section">
            <div className={`sidebar-section`} onClick={handleSignOut}>
              <div className="icon">
                <LogoutIcon sx={{ fontSize: 23 }} />
              </div>
              {!isCollapsed && <span>Logout</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Submenu Sidebar */}
      {showSubmenu && activeMenu && (
        <div
          className="submenu-sidebar"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          <div className="submenu-header">
            <span>{activeMenu.label}</span>
            <button className="close-submenu-btn" onClick={closeSubmenu}>
              <FaTimes size={16} />
            </button>
          </div>
          <div className="submenu-content">
            {activeMenu.subItems.map((subItem) => (
              <div
                key={subItem.id}
                className={`submenu-item ${
                  isSubItemActive(subItem) ? "selected-submenu-item" : ""
                }`}
                onClick={() => handleGoToSelectedPage(subItem.path)}
              >
                <div className="submenu-item-content">
                  <div className="submenu-icon">
                    {/* <div className="submenu-dot" /> */}
                  </div>
                  <span className="submenu-label">{subItem.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
