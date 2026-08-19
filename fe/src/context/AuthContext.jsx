import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// Quản lý phiên đăng nhập ở phía FE.
// Hiện lưu tạm trong localStorage; khi có BE chỉ cần thay phần thân của
// login / register / loginWithProvider bằng lời gọi API tương ứng.

const AuthContext = createContext(null);

const SESSION_KEY = "fd_auth_user";
const USERS_KEY = "fd_users";

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

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

  const persist = (nextUser) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  };

  const register = async ({ firstName, lastName, email, password, phone }) => {
    setLoading(true);
    try {
      const users = readUsers();
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Email này đã được đăng ký.");
      }
      const newUser = {
        id: Date.now(),
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        email,
        phone: phone || "",
        password, // Chỉ dùng cho bản demo — BE thật phải hash phía server.
        provider: "local",
        role: "customer",
        avatar: null,
        createdAt: new Date().toISOString(),
      };
      writeUsers([...users, newUser]);
      const { password: _pw, ...safeUser } = newUser;
      return persist(safeUser);
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password, remember }) => {
    setLoading(true);
    try {
      const users = readUsers();
      const found = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (!found) {
        throw new Error("Email hoặc mật khẩu không đúng.");
      }
      const { password: _pw, ...safeUser } = found;
      return persist({ ...safeUser, remember: !!remember });
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập qua Facebook / Twitter / Google.
  // Bản demo tạo thẳng phiên; khi tích hợp thật sẽ redirect sang OAuth provider.
  const loginWithProvider = async (providerId) => {
    setLoading(true);
    try {
      const provider = SOCIAL_PROVIDERS.find((p) => p.id === providerId);
      if (!provider) throw new Error("Nhà cung cấp không được hỗ trợ.");
      const socialUser = {
        id: `${providerId}-${Date.now()}`,
        firstName: "Người dùng",
        lastName: provider.label,
        fullName: `Người dùng ${provider.label}`,
        email: `user.${providerId}@example.com`,
        phone: "",
        provider: providerId,
        role: "customer",
        avatar: null,
        createdAt: new Date().toISOString(),
      };
      return persist(socialUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const updateProfile = (patch) => {
    if (!user) return null;
    const next = { ...user, ...patch };
    next.fullName = `${next.firstName || ""} ${next.lastName || ""}`.trim();
    const users = readUsers().map((u) =>
      u.id === user.id ? { ...u, ...patch, fullName: next.fullName } : u
    );
    writeUsers(users);
    return persist(next);
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
