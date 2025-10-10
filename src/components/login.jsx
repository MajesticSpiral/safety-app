import React, { useState } from "react";
import { useHistory } from "react-router-dom";

export default function Login() {
  const [clockNumber, setClockNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const history = useHistory();

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:4000/employees");
      const employees = await res.json();

      // Find user by clock number and password
      const user = employees.find(
        emp =>
          String(emp.clocknumber) === clockNumber.trim() &&
          emp.password === password // password field in DB
      );

      if (user) {
        localStorage.setItem("id", user.employee_id);
        history.push("/home");
      } else {
        setError("Invalid clock number or password");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to login");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Clock Number"
        value={clockNumber}
        onChange={e => setClockNumber(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
      />
      <button
        onClick={handleLogin}
        style={{ width: "100%", padding: "0.5rem" }}
      >
        Login
      </button>
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
}
