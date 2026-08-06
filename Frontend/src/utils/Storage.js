const ACCESS = "accessToken";

const REFRESH = "refreshToken";

export const storage = {

    getAccessToken() {
        return localStorage.getItem(ACCESS);
    },

    setAccessToken(token) {
        localStorage.setItem(ACCESS, token);
    },

    removeAccessToken() {
        localStorage.removeItem(ACCESS);
    },

    getRefreshToken() {
        return localStorage.getItem(REFRESH);
    },

    setRefreshToken(token) {
        localStorage.setItem(REFRESH, token);
    },

    clear() {
        localStorage.clear();
    }

}