import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const SESSION_KEY = "fd_auth_user";
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

export const SOCIAL_PROVIDERS = [
  { id: "google", label: "Google", icon: "fab fa-google", color: "#DB4437" },
  { id: "facebook", label: "Facebook", icon: "fab fa-facebook-f", color: "#1877F2" },
  { id: "twitter", label: "Twitter", icon: "fab fa-x-twitter", color: "#000000" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession());
  const [loading, setLoading] = useState(false);

  // Đồng bộ khi người dùng đăng xuất ở tab khác.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === SESSION_KEY) setUser(readSession());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = (nextUser, accessToken, refreshToken) => {
    if (nextUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
      if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      setUser(nextUser);
    } else {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setUser(null);
    }
    return nextUser;
  };

  const register = async ({ fullName, firstName, lastName, email, password, phone, address }) => {
    setLoading(true);
    try {
      const finalFullName = fullName || `${firstName || ""} ${lastName || ""}`.trim() || email.split("@")[0];
      const payload = {
        fullName: finalFullName,
        email: email.trim(),
        password,
        phone: phone && phone.trim() ? phone.trim() : null,
        address: address && address.trim() ? address.trim() : null,
      };

      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || (data.status && data.status >= 400)) {
        throw new Error(data.message || "Đăng ký không thành công!");
      }

      return data.data;
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password, remember }) => {
    setLoading(true);
    try {
      const payload = {
        email: email.trim(),
        password,
      };

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || (data.status && data.status >= 400)) {
        throw new Error(data.message || "Đăng nhập không thành công!");
      }

      const authData = data.data;
      const userSession = {
        id: authData.id,
        email: authData.email,
        fullName: authData.email.split("@")[0],
        role: authData.role,
        remember: !!remember,
      };

      persist(userSession, authData.accessToken, authData.refreshToken);
      return userSession;
    } finally {
      setLoading(false);
    }
  };

  const loginWithProvider = async (providerId) => {
    if (providerId === "google") {
      window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
      return;
    }
    if (providerId === "facebook") {
      window.location.href = `${API_BASE_URL}/oauth2/authorization/facebook`;
      return;
    }
    const provider = SOCIAL_PROVIDERS.find((p) => p.id === providerId);
    if (!provider) throw new Error("Nhà cung cấp không được hỗ trợ.");
    const socialUser = {
      id: `${providerId}-${Date.now()}`,
      fullName: `Người dùng ${provider.label}`,
      email: `user.${providerId}@example.com`,
      role: "USER",
    };
    return persist(socialUser);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (err) {
        console.error("Logout API error:", err);
      }
    }
    persist(null);
  };

  const updateProfile = (patch) => {
    if (!user) return null;
    const next = { ...user, ...patch };
    return persist(next);
  };

  const persistUserSession = (nextUser, accessToken, refreshToken) => {
    return persist(nextUser, accessToken, refreshToken);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      register,
      login,
      loginWithProvider,
      logout,
      updateProfile,
      persistUserSession,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong <AuthProvider>.");
  return ctx;
}

export default AuthContext;
