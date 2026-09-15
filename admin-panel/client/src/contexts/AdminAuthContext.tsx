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
}

const STORAGE_KEY = "lms_admin_auth_user";

// Default Authorized Master Credentials
const OWNER_CREDENTIALS = {
  email: "abhishek.j3094@gmail.com",
  password: "Abhi.3094",
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

  const login = async (emailInput: string, passwordInput: string): Promise<{ success: boolean; message?: string }> => {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    // 1. Check master owner account
    if (email === OWNER_CREDENTIALS.email.toLowerCase() && password === OWNER_CREDENTIALS.password) {
      const user: AdminUser = {
        email: OWNER_CREDENTIALS.email,
        name: OWNER_CREDENTIALS.name,
        role: OWNER_CREDENTIALS.role,
        roleLabel: OWNER_CREDENTIALS.roleLabel,
        avatar: OWNER_CREDENTIALS.avatar,
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
