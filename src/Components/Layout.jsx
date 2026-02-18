import React, { useState } from 'react'
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import './layout.css';

const Layout = ({children}) => {
    const [collapsed, setCollapsed] = useState(false);
    const toggleSidebar = () =>setCollapsed(c => !c);
  return (
     <div className={`app-layout ${collapsed ? 'collapsed' : ''}`}>
      <Topbar onToggleSidebar={toggleSidebar} />
      <div className="layout-body">
        <Sidebar collapsed={collapsed} />
        <main className="layout-main">
          {children}
                 <Footer />
        </main>
 
      </div>
    </div>
  )
}

export default Layout
