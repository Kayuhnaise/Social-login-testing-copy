import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders navigation links", () => {
  render(<App />);

  // From your NavBar: Login, Dashboard, Logout
  expect(screen.getByText(/login/i)).toBeInTheDocument();
  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/logout/i)).toBeInTheDocument();
});

test("shows Welcome text on initial route", () => {
  render(<App />);
  expect(screen.getByText(/welcome/i)).toBeInTheDocument();
});
