import React from "react";
import { FaUserCircle, FaList, FaHeartbeat, FaTh, FaChartLine, FaExclamationCircle, FaBook, FaFileAlt, FaShareAlt } from "react-icons/fa";

function MoreTab() {
  const logout = () => {
    // Clear local storage or auth token
    localStorage.clear();
    window.location.href = "/home"; // Redirect to home/login
  };

  return (
    <div className="more-tab">
      {/* Header */}
      <header className="header">
        <h1>More</h1>
      </header>

      {/* Logo */}
      <div className="logo-container">
        {/* <img src="/assets/images/logo3.png" alt="Logo" /> */}
      </div>

      {/* Profile Section */}
      <div className="section profile-section">
        <FaUserCircle size={48} />
      </div>

      <div className="separator"></div>

      {/* Organization */}
      <div className="section">
        <p className="section-title">Organization</p>
        <p className="organization-text">Kronospan Chirk</p>
      </div>

      {/* Features Section */}
      <div className="section">
        <p className="section-text"><FaList /> Issues</p>
        <p className="section-text"><FaHeartbeat /> Sensors</p>
        <p className="section-text"><FaTh /> Assets</p>
        <p className="section-text"><FaChartLine /> Analytics</p>
        <p className="section-text"><FaExclamationCircle /> Heads Up</p>
        <p className="section-text"><FaBook /> Public Library</p>
        <p className="section-text"><FaFileAlt /> Convert your paper form</p>
        <p className="section-text"><FaShareAlt /> Refer SafetyCulture</p>
      </div>

      <div className="separator"></div>

      {/* Help Section */}
      <div className="section">
        <p className="section-text">Help</p>
        <p className="section-text">Help Center</p>
        <p className="section-text">Live chat with support</p>
        <p className="section-text">Send diagnostics</p>
      </div>

      <div className="separator"></div>

      {/* Account Section */}
      <div className="section">
        <p className="section-text">Account</p>
        <p className="section-text">Settings</p>
        <button className="btn logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default MoreTab;
