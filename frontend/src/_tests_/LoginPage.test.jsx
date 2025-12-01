import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "../pages/LoginPage";

describe("LoginPage", () => {
  test("renders heading and login buttons", () => {
    render(<LoginPage />);

    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    expect(screen.getByText(/please log in to continue/i)).toBeInTheDocument();

    expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
    expect(screen.getByText(/continue with facebook/i)).toBeInTheDocument();
  });

  test("clicking Google button navigates to backend auth", () => {
    delete window.location;
    window.location = { href: "" };

    render(<LoginPage />);
    fireEvent.click(screen.getByText(/continue with google/i));

    expect(window.location.href).toBe("http://localhost:3000/auth/google");
  });

  test("clicking Facebook button navigates to backend auth", () => {
    delete window.location;
    window.location = { href: "" };

    render(<LoginPage />);
    fireEvent.click(screen.getByText(/continue with facebook/i));

    expect(window.location.href).toBe("http://localhost:3000/auth/facebook");
  });
});
