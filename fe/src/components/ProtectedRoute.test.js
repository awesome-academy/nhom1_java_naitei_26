import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "../context/AuthContext";

describe("ProtectedRoute Role-Based Access Control", () => {
  afterEach(() => {
    localStorage.clear();
  });

  test("Redirects unauthenticated user to /dang-nhap", () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="ADMIN">
                  <div>Admin Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/dang-nhap" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  test("Redirects USER role away from ADMIN protected routes to /", () => {
    localStorage.setItem(
      "fd_auth_user",
      JSON.stringify({ id: 1, email: "user@example.com", role: "USER" })
    );

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="ADMIN">
                  <div>Admin Content</div>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  test("Allows ADMIN role to access ADMIN protected routes", () => {
    localStorage.setItem(
      "fd_auth_user",
      JSON.stringify({ id: 2, email: "admin@example.com", role: "ADMIN" })
    );

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="ADMIN">
                  <div>Admin Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });
});
