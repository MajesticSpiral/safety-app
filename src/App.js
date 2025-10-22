import React, { useState } from "react";
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
  NavLink,
  useLocation,
} from "react-router-dom";
import { FaHome, FaClipboardList, FaCheckCircle, FaThLarge } from "react-icons/fa";
import HomeTab from "./components/HomeTab";
import IssuesTab from "./components/IssuesTab";
import ActionsTab from "./components/ActionsTab";
import InspectionsTab from "./components/InspectionsTab";
import MoreTab from "./components/MoreTab";
import Login from "./components/login"; 
import "./App.css";

// 404 Page Component
function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Oops! The page you're looking for does not exist.</p>
      <NavLink to="#/login" className="back-home-button">
        Go Back Home
      </NavLink>
    </div>
  );
}

// ProtectedRoute wrapper
function ProtectedRoute({ component: Component, isLoggedIn, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn ? <Component {...props} /> : <Redirect to="#/login" />
      }
    />
  );
}

// Main App Component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem("id"));
  const location = useLocation();
  const hideTabBar = location.pathname === "/login";

  // Login callback
  const handleLogin = (userId) => {
    sessionStorage.setItem("id", userId);
    setIsLoggedIn(true);
    window.location.hash = "#/home"; // redirect after login
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsLoggedIn(false);
    window.location.hash = "#/login"; // redirect after logout
  };

  return (
    <div className="app-container">
      <div className="tab-content">
        <Switch>
          {/* Default route: go to login */}
          <Route exact path="/">
            <Redirect to="#/login" />
          </Route>

          {/* Login route */}
          <Route exact path="/login">
            {isLoggedIn ? <Redirect to="#/home" /> : <Login onLogin={handleLogin} />}
          </Route>

          {/* Protected routes */}
          <ProtectedRoute exact path="/home" component={HomeTab} isLoggedIn={isLoggedIn} />
          <ProtectedRoute exact path="/issues" component={IssuesTab} isLoggedIn={isLoggedIn} />
          <ProtectedRoute exact path="/actions" component={ActionsTab} isLoggedIn={isLoggedIn} />
          <ProtectedRoute exact path="/inspections" component={InspectionsTab} isLoggedIn={isLoggedIn} />
          <ProtectedRoute exact path="/more" component={MoreTab} isLoggedIn={isLoggedIn} />

          {/* Catch-all 404 */}
          <Route component={NotFound} />
        </Switch>
      </div>

      {isLoggedIn && !hideTabBar && (
        <nav className="tab-bar">
          <NavLink exact to="#/home" activeClassName="active-tab" className="tab-button">
            <FaHome size={20} /> Home
          </NavLink>

          <NavLink exact to="#/inspections" activeClassName="active-tab" className="tab-button">
            <FaClipboardList size={20} /> Inspections
          </NavLink>

          <NavLink exact to="#/actions" activeClassName="active-tab" className="tab-button">
            <FaCheckCircle size={20} /> Actions
          </NavLink>

          <NavLink exact to="#/more" activeClassName="active-tab" className="tab-button">
            <FaThLarge size={20} /> More
          </NavLink>

          <button
            onClick={handleLogout}
            style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}
          >
            Logout
          </button>
        </nav>
      )}
    </div>
  );
}

// Wrap App with HashRouter
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
