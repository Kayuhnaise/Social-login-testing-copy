import React from "react";
import { Link } from "react-router-dom";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

export default function NavBar() {
  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, {
      method: "GET",
      credentials: "include",
    });

    window.location.href = "/login";
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard">Dashboard</Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}
