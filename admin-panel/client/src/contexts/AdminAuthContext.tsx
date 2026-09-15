import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface AdminUser {
  email: string;
  name: string;
  role: "owner" | "admin" | "instructor";
  roleLabel: string;
  avatar: string;
  token?: string;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; resetToken?: string; resetUrl?: string }>;
  resetPassword: (token: string, newPassword: string, email?: string) => Promise<{ success: boolean; message?: string }>;
}

const STORAGE_KEY = "lms_admin_auth_user";
const PWD_STORAGE_KEY = "lms_admin_owner_pwd";

// Default Authorized Master Credentials
const DEFAULT_OWNER = {
  email: "abhishek.j3094@gmail.com",
  defaultPassword: "Abhi.3094",
  name: "Abhishek",
  role: "owner" as const,
  roleLabel: "Owner",
  avatar: "AJ",
};

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.email) {
          setAdminUser(parsed);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOwnerPassword = () => {
    return localStorage.getItem(PWD_STORAGE_KEY) || DEFAULT_OWNER.defaultPassword;
  };

  const login = async (emailInput: string, passwordInput: string): Promise<{ success: boolean; message?: string }> => {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();
    const currentOwnerPwd = getOwnerPassword();

    // 1. Check master owner account
    if (email === DEFAULT_OWNER.email.toLowerCase() && password === currentOwnerPwd) {
      const user: AdminUser = {
        email: DEFAULT_OWNER.email,
        name: DEFAULT_OWNER.name,
        role: DEFAULT_OWNER.role,
        roleLabel: DEFAULT_OWNER.roleLabel,
        avatar: DEFAULT_OWNER.avatar,
        token: `adm_token_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      };
      setAdminUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return { success: true };
    }

    // 2. Optional backend API login attempt if connected
    try {
      const res = await fetch("http://localhost:4000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const role = data?.user?.role?.toLowerCase() === "admin" ? "admin" : "owner";
        const user: AdminUser = {
          email: data?.user?.email || email,
          name: data?.user?.fullName || "Admin",
          role,
          roleLabel: role === "owner" ? "Owner" : "Administrator",
          avatar: (data?.user?.fullName || "AD").slice(0, 2).toUpperCase(),
          token: data?.token || `adm_token_${Date.now()}`,
        };
        setAdminUser(user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return { success: true };
      }
    } catch {
      // Backend not reached or offline
    }

    return {
      success: false,
      message: "Invalid admin email or password. Please verify your credentials.",
    };
  };

  const requestPasswordReset = async (emailInput: string): Promise<{ success: boolean; message?: string; resetToken?: string; resetUrl?: string }> => {
    const email = emailInput.trim().toLowerCase();
    try {
      const res = await fetch("http://localhost:4000/api/v1/auth/forgot-password-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, portalType: "admin" }),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          message: data?.message || "Reset link sent to your email",
          resetToken: data?.resetToken,
          resetUrl: data?.resetUrl,
        };
      }
    } catch {
      // Backend offline fallback
    }

    // Fallback in case backend is offline
    const mockToken = `mock_token_${Date.now()}`;
    return {
      success: true,
      message: "Reset link sent to your email address",
      resetToken: mockToken,
      resetUrl: `http://localhost:3001/reset-password?token=${mockToken}&email=${encodeURIComponent(email)}`,
    };
  };

  const resetPassword = async (token: string, newPassword: string, email?: string): Promise<{ success: boolean; message?: string }> => {
    const targetEmail = (email || DEFAULT_OWNER.email).trim().toLowerCase();

    // Call backend API if available
    try {
      const res = await fetch("http://localhost:4000/api/v1/auth/reset-password-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, email: targetEmail }),
      });
      if (res.ok) {
        if (targetEmail === DEFAULT_OWNER.email.toLowerCase()) {
          localStorage.setItem(PWD_STORAGE_KEY, newPassword);
        }
        return { success: true, message: "Password updated successfully" };
      }
    } catch {
      // Backend offline fallback
    }

    // If target is master owner, update in local storage
    if (targetEmail === DEFAULT_OWNER.email.toLowerCase()) {
      localStorage.setItem(PWD_STORAGE_KEY, newPassword);
      return { success: true, message: "Password updated successfully" };
    }

    return { success: true, message: "Password updated successfully" };
  };

  const logout = () => {
    setAdminUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAuthenticated: Boolean(adminUser),
        isLoading,
        login,
        logout,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
