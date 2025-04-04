import jwtDecode from "jwt-decode";
import axios from "axios";
import history from "@history";
import Utils from "app/helpers/utils";
import apiConfig from "app/configs/api.config";

axios.defaults.baseURL = apiConfig.baseURL; 
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest"; 
axios.defaults.headers.common["Accept-Language"] = "vi"; 
axios.defaults.withCredentials = true; 
delete axios.defaults.headers.common.Authorization; 

class JwtService extends Utils.EventEmitter { 
  
  init() {
    this.handleAuthentication();
  }
  handleAuthentication = () => {
    const dataToken = {
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken(),
    };
    if (!dataToken.accessToken) {
      this.emit("onNoAccessToken");
      return;
    }

    if (this.isAuthTokenValid(dataToken)) {
      this.setSession(dataToken);
      this.emit("onAutoLogin", true);
    } else {
      this.setSession(null);
      this.emit("onAutoLogout", "access_token expired");
    }
  };

  createUser = (data) =>
    new Promise((resolve, reject) => {
      axios.post("/api/auth/register", data).then((response) => {
        if (response.data.user) {
          this.setSession(response.data.access_token);
          resolve(response.data.user);
        } else {
          reject(response.data.error);
        }
      });
    });

  signInWithUsernameAndPassword = (param) =>
    axios.post("/guest/token", param).then((res) => {
      if (res.data.status !== 200) return Promise.reject(res.data.message);
      
      this.setSession(res.data.data);
      const user = {
        status: res.data.status,
        data: res.data,
        role: "USER",
        redirectUrl: "/forecast",
      };
      return user;
    });

    handleForgotPasswordSubmit = (param) => {
      axios.post("/guest/forgot-password", param).then((res) => {
        if (res.data.status!== 200) return Promise.reject(res.data.message);
        const repass = {
          status: res.data.status,
          data: res.data,
          role: "USER",
          redirectUrl: "/",
        };
        return repass;
      });
    }
    

  signInWithRefreshToken = () =>
    axios
      .post("/guest/refresh-token", { refreshToken: this.getRefreshToken() })
      .then((res) => {
        if (!res.data.data) {
          throw new Error("Failed to login with refresh token.");
        }
        this.setSession(res.data.data);
        return {
          data: res.data.data,
          role: "USER",
        };
      })
      .catch(() => {
        this.logout();
        throw new Error("Failed to login with refresh token.");
      });

      signInWithToken = async () => {
    delete axios.defaults.headers.common.Authorization;
    try {
      const res = await axios.post("/guest/refresh-token", {
        refreshToken: this.getRefreshToken(),
      });
      if (!res.data.data) {
        this.logout();
        throw new Error("Please login!!!");
      }
      const dataToken = {
        accessToken: res.data.data.accessToken,
        refreshToken: res.data.data.refreshToken,
      };
      this.setSession(dataToken);
      return dataToken.accessToken;
    } catch (error) {
      this.logout();
      throw new Error("Failed to login with refresh token.");
    }
  };
  updateUserData = (user) => axios.post("/api/auth/user/update", { user });

  setSession = (dataToken) => {
    if (dataToken?.accessToken) {
      window.localStorage.setItem(
        apiConfig.accessTokenKey,
        dataToken.accessToken
      );
      window.localStorage.setItem(
        apiConfig.refreshTokenKey,
        dataToken.refreshToken
      );
    } else {
      window.localStorage.removeItem(apiConfig.accessTokenKey);
      delete axios.defaults.headers.common.Authorization;
    }
  };

  logout = () => {
    window.localStorage.removeItem(apiConfig.accessTokenKey);
    window.localStorage.removeItem(apiConfig.refreshTokenKey);
    delete axios.defaults.headers.common.Authorization;
    history.push({
      pathname: "/",
    });
  };

  isAuthTokenValid = (dataToken) => {
    if (!dataToken) {
      return false;
    }
    const decodedRefreshToken = jwtDecode(dataToken.refreshToken);
    const decoded = jwtDecode(dataToken.accessToken);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime && decodedRefreshToken.exp < currentTime) {
      console.warn("access token and refresh token expired");
      history.push("/");
      return false;
    }
    return true;
  };
  isTokenExpired = () => {
    const decodedRefreshToken = jwtDecode(
      window.localStorage.getItem(apiConfig.refreshTokenKey)
    );
    const decoded = jwtDecode(
      window.localStorage.getItem(apiConfig.accessTokenKey)
    );
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime && decodedRefreshToken > currentTime) {
      return false;
    }
    return true;
  };
  getAccessToken = () => window.localStorage.getItem(apiConfig.accessTokenKey);
  getRefreshToken = () =>
    window.localStorage.getItem(apiConfig.refreshTokenKey);
}

const instance = new JwtService();

export default instance;
