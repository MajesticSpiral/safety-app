import React from "react";
import {
  HashRouter as Router, // ✅ Use HashRouter instead of BrowserRouter
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
import Login from "./components/login"; // must match login.jsx
import "./App.css";

// 404 Page Component
function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Oops! The page you're looking for does not exist.</p>
      <NavLink to="/home" className="back-home-button">
        Go Back Home
      </NavLink>
    </div>
  );
}

// ProtectedRoute wrapper
function ProtectedRoute({ component: Component, ...rest }) {
  const isLoggedIn = !!localStorage.getItem("id");
  return (
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
}

// Main App Component
function App() {
  const isLoggedIn = !!localStorage.getItem("id");
  const location = useLocation();
  const hideTabBar = location.pathname === "/login"; // hide only on login page

  return (
    <div className="app-container">
      {/* Main content */}
      <div className="tab-content">
        <Switch>
          {/* Login route */}
          <Route exact path="/login">
            {isLoggedIn ? <Redirect to="/home" /> : <Login />}
          </Route>

          {/* Protected routes */}
          <ProtectedRoute exact path="/home" component={HomeTab} />
          <ProtectedRoute exact path="/issues" component={IssuesTab} />
          <ProtectedRoute exact path="/actions" component={ActionsTab} />
          <ProtectedRoute exact path="/inspections" component={InspectionsTab} />
          <ProtectedRoute exact path="/more" component={MoreTab} />

          {/* ✅ Default route - redirect to login if not logged in */}
          <Route exact path="/">
            <Redirect to={isLoggedIn ? "/home" : "/login"} />
          </Route>

          {/* Catch-all 404 route */}
          <Route component={NotFound} />
        </Switch>
      </div>

      {/* Bottom tab bar - visible only if logged in and not on login page */}
      {isLoggedIn && !hideTabBar && (
        <nav className="tab-bar">
          <NavLink
            exact
            to="/home"
            activeClassName="active-tab"
            className="tab-button"
          >
            <FaHome size={20} /> Home
          </NavLink>

          <NavLink
            exact
            to="/inspections"
            activeClassName="active-tab"
            className="tab-button"
          >
            <FaClipboardList size={20} /> Inspections
          </NavLink>

          <NavLink
            exact
            to="/actions"
            activeClassName="active-tab"
            className="tab-button"
          >
            <FaCheckCircle size={20} /> Actions
          </NavLink>

          <NavLink
            exact
            to="/more"
            activeClassName="active-tab"
            className="tab-button"
          >
            <FaThLarge size={20} /> More
          </NavLink>
        </nav>
      )}
    </div>
  );
}

// ✅ Wrap App with HashRouter (required for GitHub Pages)
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
