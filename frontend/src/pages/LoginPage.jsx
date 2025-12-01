import React from "react";
import "./LoginPage.css";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

export default function LoginPage() {
  const handleGoogle = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  const handleFacebook = () => {
    window.location.href = `${API_BASE}/auth/facebook`;
  };

  return (
    <div className="login-page">
      <h1>Social Login App</h1>
      <p>Choose a provider to sign in:</p>

      <button className="login-btn google" onClick={handleGoogle}>
        Login with Google
      </button>

      <button className="login-btn facebook" onClick={handleFacebook}>
        Login with Facebook
      </button>
    </div>
  );
}

