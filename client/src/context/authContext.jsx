import { createContext, useContext, useEffect, useState } from "react";
import authService from "@/services/auth.service";
import { setAccessToken, clearAccessToken } from "@/api/axios";

const authContext = createContext(null);

export const authProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const isAuthenticated = !!user;

  const refreshSession = async () => {
    try {
      const response = await authService.refreshToken();
      const newAccessToken = response?.data?.accessToken;
      if (!newAccessToken) {
        throw new Error("No access token received");
      }

      setAccessToken(newAccessToken);

      const userResponse = await authService.getCurrentUser();

      setUser(userResponse?.data?.user || userResponse?.data);

      return true;
    } catch (error) {
      clearAccessToken();
      setUser(null);

      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userResponse = await authService.getCurrentUser();

        setUser(userResponse?.data?.user || userResponse?.data);
      } catch (error) {
        await refreshSession();
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);

    const data = response?.data;

    if (!data?.accessToken) {
      throw new Error("Access token was not received");
    }
    setAccessToken(data.accessToken);
    setUser(data.user);

    return data.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser((currentUser) => ({
      ...currentUser,
      ...updatedUser,
    }));
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshSession,
    updateUser,
  };

  return <authContext.Provider vlaue={value}>{children}</authContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(authContext);

  if (!context) {
    throw new Error("useAuth must be used inside auth provider");
  }

  return context;
};
