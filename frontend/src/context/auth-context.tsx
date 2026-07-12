"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiClient, setMemoryAccessToken } from "@/services/api-client";

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

interface Organization {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  org_id: string;
  role_id: string;
  organization?: Organization;
  role?: Role;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, password: string, orgName: string) => Promise<void>;
  logout: () => Promise<void>;
  checkPermissions: (permissionName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch User details
  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get<User>("/auth/me");
      setUser(response.data);
    } catch (err) {
      setUser(null);
      setMemoryAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Initialize Session (Silent refresh check on mount)
  const initializeAuth = async () => {
    try {
      const response = await apiClient.post("/auth/refresh");
      const { access_token } = response.data;
      setMemoryAccessToken(access_token);
      await fetchCurrentUser();
    } catch (err) {
      setUser(null);
      setMemoryAccessToken(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();

    // Event listener for token expiration interceptors
    const handleSessionExpired = () => {
      setUser(null);
      setMemoryAccessToken(null);
      router.push("/login");
    };

    window.addEventListener("auth_session_expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth_session_expired", handleSessionExpired);
    };
  }, []);

  // 3. Login API caller
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await apiClient.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token } = response.data;
      setMemoryAccessToken(access_token);
      await fetchCurrentUser();
      router.push("/dashboard");
    } catch (error) {
      setMemoryAccessToken(null);
      setUser(null);
      setIsLoading(false);
      throw error;
    }
  };

  // 4. Register API caller
  const register = async (email: string, password: string, orgName: string) => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/register", {
        email,
        password,
        org_name: orgName,
      });
      // Redirect to login after successful signup
      router.push("/login");
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  // 5. Logout API caller
  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed", err);
    } finally {
      setMemoryAccessToken(null);
      setUser(null);
      setIsLoading(false);
      router.push("/");
    }
  };

  // Helper check for RBAC permission tags
  const checkPermissions = (permissionName: string) => {
    if (!user || !user.role || !user.role.permissions) return false;
    return user.role.permissions.some((p) => p.name === permissionName);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    checkPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
