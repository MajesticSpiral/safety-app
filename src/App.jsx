// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "../components/Login";
import HomeTab from "./components/HomeTab";
import IssuesTab from "./components/IssuesTab";

function App() {
  const isLoggedIn = !!localStorage.getItem("id"); // check if user is logged in

  return (
    <Router>
      <Routes>
        {/* Login route */}
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/home" /> : <Login />}
        />

        {/* Protected routes */}
        <Route
          path="/home"
          element={isLoggedIn ? <HomeTab /> : <Navigate to="/login" />}
        />
        <Route
          path="/issues"
          element={isLoggedIn ? <IssuesTab /> : <Navigate to="/login" />}
        />

        {/* Default route */}
        <Route
          path="/"
          element={isLoggedIn ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
