import axios from "axios";
import { API } from "../utils/Constants";
import { storage } from "../utils/Storage";

const axiosInstance = axios.create({

    baseURL: API.BASE_URL,

    headers: {

        "Content-Type": "application/json"

    }

});

axiosInstance.interceptors.request.use((config) => {

    const token = storage.getAccessToken();

    if (token) {

        config.headers.Authorization = `Bearer ${token}`;

    }

    return config;

});

export default axiosInstance;


axiosInstance.interceptors.response.use(

response => response,

async (error)=>{

const originalRequest=error.config;

if(
error.response?.status===401 &&
!originalRequest._retry
){

originalRequest._retry=true;

try{

const refreshToken=storage.getRefreshToken();

const res=await axios.post(

`${API.BASE_URL}/api/auth/refresh-token`,

{

refreshToken

}

);

storage.setAccessToken(

res.data.accessToken

);

originalRequest.headers.Authorization=

`Bearer ${res.data.accessToken}`;

return axiosInstance(originalRequest);

}

catch{

storage.clear();

window.location="/login";

}

}

return Promise.reject(error);

}

)