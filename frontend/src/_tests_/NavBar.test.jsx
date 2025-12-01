import React from "react";
import { BrowserRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import NavBar from "../components/NavBar";

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe("NavBar", () => {
  test("renders Login, Dashboard, and Logout", () => {
    renderWithRouter(<NavBar />);

    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });
});
