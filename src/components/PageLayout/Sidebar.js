"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { logOut, useSelectUser } from "../../../redux/slices/authSlice";
import {
  resetUnsavedState,
  setPendingPath,
  setShowModal,
  useSelectUnsavedChanges,
} from "../../../redux/slices/confirmModalSlice";
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
  FaBuilding,
  FaChevronDown,
  FaPlus,
} from "react-icons/fa";
import { ImHammer2 } from "react-icons/im";
import { useState, useRef, useEffect } from "react";
import {
  switchCompany,
  useSelectAllCompanies,
  useSelectCurrCompany,
  useSelectIsAdmin,
} from "../../../redux/slices/companySlice";
import {
  useSelectUserPermissions,
  useSelectUserRoles,
} from "../../../redux/slices/roleAuthSlice";
import { filterMenuByPermissions } from "@/utils/filterSidebarMenuByPermission";

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const user = useSelectUser();
  const unsavedChanges = useSelectUnsavedChanges();
  const currCompany = useSelectCurrCompany();
  const companies = useSelectAllCompanies();
  const userPermissions = useSelectUserPermissions();
  const role = useSelectUserRoles();
  const isAdmin = useSelectIsAdmin();

  const [activeMenu, setActiveMenu] = useState(null);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const companyDropdownRef = useRef(null);

  const LogoutIcon = dynamic(
    () => import("@mui/icons-material/LogoutOutlined"),
    { ssr: false }
  );

  const currentPath = router.asPath;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        companyDropdownRef.current &&
        !companyDropdownRef.current.contains(event.target)
      ) {
        setShowCompanyDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    // {
    //   id: "dashboard",
    //   label: "Dashboard",
    //   icon: <FaThLarge size={20} />,
    //   path: "/dashboard",
    // },
    {
      id: "kpi",
      label: "KPI",
      icon: <FaChartLine size={20} />,
      subItems: [
        {
          id: "kpi-list",
          label: "Kpi List",
          path: "/kpi/kpi-list",
        },
        {
          id: "kpi-dashboard",
          label: "KPI Dashboard",
          path: "/kpi/kpi-dashboard",
        },
      ],
    },
    {
      id: "graph",
      label: "Graph",
      icon: <FaChartBar size={20} />,
      subItems: [
        {
          id: "graph-publish",
          label: "Published Graph",
          path: "/graph/graph-publish",
        },
        {
          id: "graph-list",
          label: "Graph Client",
          path: "/graph/group/graph-list",
        },
        {
          id: "graph-form",
          label: "Graph Form",
          path: "/graph/form/graph-list",
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
          path: "/form/form-template/form-template-list",
        },
        {
          id: "apply-form",
          label: "Apply Form",
          path: "/form/form-submission/apply-form-list",
        },
        {
          id: "form-submission",
          label: "Your submitted forms",
          path: "/form/form-submission/form-submission-list",
        },
        {
          id: "form-approval",
          label: "Form Approval",
          path: "/form/form-approval/form-approval-list",
        },
      ],
    },
    {
      id: "appointment",
      label: "Appointment",
      icon: <FaCalendarAlt size={20} />,
      subItems: [
        { id: "calendar", label: "Calendar", path: "/appointment/calendar" },
      ],
    },
    {
      id: "control-panel",
      label: "Control Panel",
      icon: <FaSlidersH size={20} />,
      subItems: [
        { id: "logs", label: "Logs", path: "/control-panel/logs" },
        { id: "users", label: "User", path: "/control-panel/user-list" },
        { id: "role", label: "Role", path: "/control-panel/role-list" },
        // {
        //   id: "company-profile",
        //   label: "Company Profile",
        //   path: "/control-panel/company-profile",
        // },
      ],
    },
    {
      id: "create-company",
      label: "Create Company",
      path: "/control-panel/create-company",
      icon: <FaPlus size={20} />,
    },
  ];

  const menu = filterMenuByPermissions(
    menuItems,
    userPermissions,
    isAdmin,
    currCompany
  );

  const handleGoToSelectedPage = (path) => {
    if (router.asPath === path) {
      router.replace(path);
    } else {
      router.push(path);
    }
    setShowSubmenu(false);
    setActiveMenu(null);
  };

  const handleSignOut = () => {
    dispatch(logOut({ router }));
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setShowSubmenu(false);
      setActiveMenu(null);
    }
  };

  const handleMenuClick = (menu) => {
    const hasSubItems = menu.subItems && menu.subItems.length > 0;

    if (hasSubItems) {
      if (activeMenu?.id === menu.id && showSubmenu) {
        setShowSubmenu(false);
        setActiveMenu(null);
      } else {
        setActiveMenu(menu);
        setShowSubmenu(true);
      }
    } else if (menu.path) {
      handleGoToSelectedPage(menu.path);
    }
  };

  const closeSubmenu = () => {
    setShowSubmenu(false);
    setActiveMenu(null);
  };

  const toggleCompanyDropdown = () => {
    setShowCompanyDropdown(!showCompanyDropdown);
  };

  const handleCompanySwitch = (company) => {
    dispatch(switchCompany({ company_id: company.company_id }));
    setShowCompanyDropdown(false);
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

  const isSubItemActive = (subItem) =>
    currentPath === subItem.path || currentPath.startsWith(subItem.path + "/");

  return (
    <>
      {showSubmenu && (
        <div className="submenu-backdrop" onClick={closeSubmenu} />
      )}

      <div className={`sidebar-container ${isCollapsed ? "collapsed" : ""}`}>
        {/* --- TOP --- */}
        <div
          className={`sidebar-top-section ${
            !isCollapsed ? "top-section-justify-end" : ""
          }`}
        >
          {!isCollapsed ? (
            <div className="sidebar-header">
              <div className="company-selector" ref={companyDropdownRef}>
                <div
                  className="company-current"
                  onClick={toggleCompanyDropdown}
                >
                  <FaBuilding className="company-icon" />
                  <span className="company-name">
                    {currCompany?.company_name || "Select Company"}
                  </span>
                  <FaChevronDown
                    className={`dropdown-arrow ${
                      showCompanyDropdown ? "rotated" : ""
                    }`}
                  />
                </div>

                {showCompanyDropdown && (
                  <div className="company-dropdown">
                    <div className="dropdown-header">
                      <span>Switch Company</span>
                    </div>
                    <div className="dropdown-list">
                      {companies.map((company) => (
                        <div
                          key={company.company_id}
                          className={`dropdown-item ${
                            currCompany?.company_id === company.company_id
                              ? "active"
                              : ""
                          }`}
                          onClick={() => handleCompanySwitch(company)}
                        >
                          <span className="item-name">
                            {company.company_name || "N/A"}
                          </span>
                          {currCompany?.company_id === company.company_id && (
                            <div className="active-indicator" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}

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

        {/* --- MENU --- */}
        <div className="sidebar-bottom-section">
          <div className="mid-section">
            {menu.map((menu) => {
              const isActive = isMenuActive(menu);
              const hasSubItems = menu.subItems?.length;

              return (
                <div key={menu.id} className="menu-group">
                  <div
                    className={`sidebar-section menu-item ${
                      isActive ? "selected-sidebar-section" : ""
                    }`}
                    onClick={() => handleMenuClick(menu)}
                  >
                    <div className="menu-item-content">
                      <div className="icon">{menu.icon}</div>
                      {!isCollapsed && (
                        <>
                          <span className="menu-label">{menu.label}</span>
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

          {/* --- LOGOUT --- */}
          <div className="bottom-section">
            <div className="sidebar-section menu-item" onClick={handleSignOut}>
              <div className="menu-item-content">
                <div className="icon">
                  <LogoutIcon sx={{ fontSize: 23 }} />
                </div>
                {!isCollapsed && <span className="menu-label">Logout</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SUBMENU --- */}
      {showSubmenu && activeMenu && (
        <div className="submenu-sidebar">
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
                    <div className="submenu-dot" />
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
