import api from "../api/axios";

const authService = {
  login: async (Credentials) => {
    const response = await api.post("/auth/login", Credentials);
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post("/auth/refresh-token");
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/current-user");
    return response.data;
  },
  
  register: async (data) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.put("/auth/complete-profile", data);
    return response.data;
  },

  completeProfile: async (data) => {
    const response = await api.post("/auth/change-password", data);
    return response.data;
  },

  uploadAvatar: async (formData) => {
    const response = await api.put("/auth/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },

  resetPassword: async (data) => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },

  registerPHC: async (data) => {
    const response = await api.post("/auth/register-phc", data);
    return response.data;
  },
};

export default authService;
