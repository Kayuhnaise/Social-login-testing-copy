import React from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";

export default function NavBar() {
  const handleLogout = async () => {
    await fetch("http://localhost:3000/logout", {
      method: "GET",
      credentials: "include"
    });
    window.location.href = "/login";
  };

  return (
    <nav className="navbar-modern">
      <div className="left">
        <Link to="/login">Login</Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>

      <button className="logout-modern" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}
