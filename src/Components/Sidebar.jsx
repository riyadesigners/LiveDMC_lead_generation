import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Addleadicon from "../assets/Lead.png";
import detailsleadicon from "../assets/lead-details.png";
import Invoiceicon from "../assets/invoice.png";
import Setting from "../assets/setting.png";

const menuConfig = [
  {
    title: "Dashboard",
       icon: Invoiceicon,
    path: "/dashboard",
    roles:["admin", "superadmin", "user"],
  },
  {
    title: "Add Performa",
    icon: Addleadicon,
    path: "/New-lead",
    roles:["admin", "superadmin", "user"],
  },
  {
    title: "Proforma Invoices",
    icon: detailsleadicon,
    path: "/Leadlist",
    roles:["admin", "superadmin", "user"],
  },
 {
    title: "Add Users",
    icon: Invoiceicon,
    path: "/Newuser",
    roles:["admin", "superadmin"],
  },
 {
    title: "Settings",
    icon: Setting,
    path: "/settings",
    roles:[ "superadmin"],
  },
  
];

const Sidebar = ({ collapsed }) => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const sidebarRef  = useRef(null);

  const userData = JSON.parse(localStorage.getItem("riya_user") || "{}");
  const userRole = userData?.role?.toLowerCase() || "";

  const filteredMenu = menuConfig.filter((menu) =>
    menu.roles.includes(userRole) 
    );
  // Auto open submenu if route matches
  useEffect(() => {
    filteredMenu.forEach((menu, index) => {
      if (menu.children) {
        const match = menu.children.find(
          (child) => location.pathname === child.path
        );
        if (match) setOpenMenu(index);
      }
    });
  }, [location.pathname]);
  //Close sidebar click outside
  useEffect(()=>{
    const handleClickOutside = (event) => {
      if (sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ){
        setOpenMenu (null);
      }
    };
    document.addEventListener ("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener ("mousedown", handleClickOutside);
    };
  }, [])
  const isParentActive = (children = []) =>
  children.some((child) =>
    location.pathname.startsWith(
      child.path.split("/").slice(0,2).join("/")
    )
  );
 
  return (
    <aside ref={sidebarRef} className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      <nav className="sidebar__nav">
        {filteredMenu.map((menu, index) => (
          <div key={index}>
            {!menu.children ? (
              <NavLink
                to={menu.path}
                end
                className={({ isActive }) =>
                  isActive ? "sidebar__link active" : "sidebar__link"
                }
              >
               <img src={menu.icon} alt={menu.title} className="sidebar__icon" />
                {!collapsed && <span className="label">{menu.title}</span>}
              </NavLink>
            ) : (
              <>
               <div className="sidebar__menu-item">
                  <div
                  className={`sidebar__link sidebar__link--parent ${
                    isParentActive() ? "active" : ""
                  }`}
                  onClick={() =>
                    setOpenMenu(openMenu === index ? null : index)
                  }
                >

                   <img
  src={menu.icon}
  alt={menu.title} className="sidebar__icon" />
                    {!collapsed && (
                      <>
                        <span className="label">{menu.title}</span>
                        <i
                          className={`fas fa-chevron-right arrow ${
                            openMenu === index ? "open" : ""
                          }`}
                        ></i>
                      </>
                    )}
                  </div>

                  <div
                    className={`sidebar__submenu ${
                      openMenu === index ? "show" : ""
                    } ${collapsed ? "collapsed-flyout" : ""}`}
                  >
                    {menu.children.map((child, cIndex) => (
                      <NavLink
                        key={cIndex}
                        to={child.path}
                        className={({ isActive }) =>
                          isActive
                            ? "sidebar__sublink active"
                            : "sidebar__sublink"
                        }
                        onClick={() => collapsed && setOpenMenu(null)}
                      >
                        <i className="fas fa-circle"></i>
                        <span>{child.title}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>

              </>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
