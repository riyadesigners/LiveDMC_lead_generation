import React, { useState , useEffect, useRef} from 'react'
import Riyalogo from '../assets/logo.png'

const Topbar = ({ onToggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  //get log in details
  const userData = JSON.parse(localStorage.getItem("riya_user") || "{}");
  const username = userData?.username || "User";
  const avatarletter = username.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("riya_user");
    window.location.href = "/entities";
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-toggle" onClick={onToggleSidebar}>
          <i className="fas fa-bars"></i>
        </button>
        <img src={Riyalogo} alt="Riya Travel" className='img-fluid' style={{ maxHeight: '60px' }}  /> <span className="topbar-title">DMC Thailand</span>
      </div>

      <div className="topbar-right" ref={notificationRef}>
         
        <button
          className="icon-btn"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <i className="fas fa-bell"></i>
          <span className="notification-dot"></span>
        </button>

        
        {showNotifications && (
          <div className="notification-dropdown">
            <h6>Notifications</h6>
            <ul>
              <li>  New lead added</li>
              <li> Follow-up scheduled today</li>
              <li> Lead converted successfully</li>
            </ul>
            <button className="view-all-btn">View All</button>
          </div>
        )}

        {/* User */}
        <div className="user-info">
          <div className="avatar">{avatarletter}</div>
          <span className="username">{username}</span>
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
          title="Logout"
        >
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
