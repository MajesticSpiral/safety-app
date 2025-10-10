import React from "react";
import { useHistory } from "react-router-dom";

function HomeTab() {
  const history = useHistory();

  const navigateToIssues = () => {
    history.push("/issues");
  };

  return (
    <div className="home-tab">
      {/* Header */}
      <header className="header blue-header">
        <h1>Home</h1>
        <button className="header-button">🔔</button>
      </header>

      {/* Main Content */}
      <div className="content">
        <div className="card small-card" onClick={navigateToIssues}>
          <div className="card-header">
            <span className="card-icon">⚠️</span>
            <p>Issues</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeTab;
