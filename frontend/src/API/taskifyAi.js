import axios from "axios";
class TokenService {
  static ACCESS_TOKEN_KEY = "accessToken";
  static REFRESH_TOKEN_KEY = "refreshToken";

  static setTokens(accessToken, refreshToken) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static getAccessToken() {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static clearTokens() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}
class BaseApi {
  constructor() {
    this.api = axios.create({
      baseURL: "http://localhost:5000/api",
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }
  setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        const token = TokenService.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = TokenService.getRefreshToken();

            if (!refreshToken) {
              TokenService.clearTokens();
              window.location.href = "/login";
              return Promise.reject(error);
            }

            const response = await axios.post(
              "http://localhost:5000/api/user/refresh-token",
              {
                refreshToken,
              }
            );

            if (response.data.success) {
              const { accessToken, refreshToken: newRefreshToken } =
                response.data;
              TokenService.setTokens(accessToken, newRefreshToken);

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            } else {
              TokenService.clearTokens();
              window.location.href = "/login";
              return Promise.reject(error);
            }
          } catch (refreshError) {
            console.error("Token refresh failed", refreshError);
            TokenService.clearTokens();
            window.location.href = "/login";
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }
}
class AuthApi extends BaseApi {
  async login(email, password) {
    try {
      const { data } = await this.api.post("/user/login", {
        email,
        password,
      });

      if (data.success) {
        TokenService.setTokens(data.accessToken, data.refreshToken);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Connection error!",
      };
    }
  }

  async signup(userData) {
    try {
      const { data } = await this.api.post("/user/signup", userData);

      if (data.success && data.accessToken && data.refreshToken) {
        TokenService.setTokens(data.accessToken, data.refreshToken);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed!",
      };
    }
  }

  async refreshToken() {
    try {
      const refreshToken = TokenService.getRefreshToken();

      if (!refreshToken) {
        return {
          success: false,
          message: "No refresh token found!",
        };
      }

      const { data } = await this.api.post("/user/refresh-token", {
        refreshToken,
      });

      if (data.success) {
        TokenService.setTokens(data.accessToken, data.refreshToken);
      }

      return data;
    } catch (error) {
      console.error("Token renewal failed:", error);
      return {
        success: false,
        message: "Token renewal failed!",
      };
    }
  }

  logout() {
    TokenService.clearTokens();
  }
}

class EntryApi extends BaseApi {
  async createEntry(formData) {
    try {
      const { data } = await this.api.post("/entry/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Entry creation failed!",
      };
    }
  }

  async getAllEntries(_body) {
    try {
      const { data } = await this.api.get("/entry/all", _body);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch entries!",
      };
    }
  }

  async deleteEntry(id) {
    try {
      const { data } = await this.api.delete(`/entry/delete/${id}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete entry!",
      };
    }
  }

  async getAIAdvice(content) {
    try {
      const { data } = await this.api.post("/entry/ai-advice", { content });
      return data;
    } catch (error) {
      return {
        success: false,
        error: true,
        message:
          error.response?.data?.message || "AI advice generation failed!",
      };
    }
  }

  async fixGrammar(content) {
    try {
      const { data } = await this.api.post("/entry/fix-grammar", { content });
      return data;
    } catch (error) {
      return {
        success: false,
        error: true,
        message: error.response?.data?.message || "Grammar correction failed!",
      };
    }
  }

  async updateEntry(id, entryData) {
    try {
      const { data } = await this.api.put(`/entry/update/${id}`, entryData);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update entry!",
      };
    }
  }

  async getEntryById(id) {
    try {
      const { data } = await this.api.get(`/entry/detail/${id}`);
      return data;
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch entry details!",
      };
    }
  }
}

class TagApi extends BaseApi {
  async getAllTags() {
    try {
      const { data } = await this.api.get("/tag/all");
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch tags!",
      };
    }
  }

  async createTag(tagData) {
    try {
      const { data } = await this.api.post("/tag/create", tagData);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Tag creation failed!",
      };
    }
  }
}

export { TokenService, AuthApi };
export const entryApi = new EntryApi();
export const tagApi = new TagApi();
export default new AuthApi();
