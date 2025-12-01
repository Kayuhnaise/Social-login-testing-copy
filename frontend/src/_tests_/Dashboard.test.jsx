// frontend/src/_tests_/Dashboard.test.jsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Dashboard from "../pages/Dashboard";

describe("Dashboard", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    // reset window.location each time
    delete window.location;
    window.location = { href: "" };
  });

  test("redirects to /login when /profile returns 401", async () => {
    // 1st fetch: /profile (401)
    // 2nd fetch: /api/items (empty array)
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "Not authenticated" })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => []
      });

    render(<Dashboard />);

    await waitFor(() => {
      expect(window.location.href).toBe("/login");
    });
  });

  test("displays user name and items when fetch succeeds", async () => {
    // 1st fetch: /profile
    // 2nd fetch: /api/items
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ displayName: "Keya Gangadharan", photo: null })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [{ id: 1, label: "cat", value: "3" }]
      });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/keya gangadharan/i)).toBeInTheDocument();
      expect(screen.getByText(/cat/i)).toBeInTheDocument();
    });
  });

  test("logout calls backend and redirects to /login", async () => {
    // 1st fetch: /profile
    // 2nd fetch: /api/items
    // 3rd fetch: /logout
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ displayName: "Keya", photo: null })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({})
      });

    window.location.href = "/dashboard";

    render(<Dashboard />);

    const logoutButton = screen.getByText(/logout/i);
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(window.location.href).toBe("/login");
    });

    expect(global.fetch).toHaveBeenLastCalledWith(
      "http://localhost:3000/logout",
      expect.objectContaining({ method: "GET" })
    );
  });
});

