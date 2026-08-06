import axiosInstance from "./AxiosInstance";

export const authApi = {

login:(payload)=>

axiosInstance.post(

"/api/auth/login",

payload

),

register:(payload)=>

axiosInstance.post(

"/api/auth/register",

payload

),

verifyOTP:(payload)=>

axiosInstance.post(

"/api/auth/verify-otp",

payload

),

logout:()=>

axiosInstance.post(

"/api/auth/logout"

)

}