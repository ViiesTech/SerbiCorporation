export const BASE_URL = 'https://appsdemo.pro/Serbi-Backend/api/user/'
export const IMAGE_URL = 'https://appsdemo.pro/Serbi-Backend/'

export const endpoints = {
  SIGNUP: 'signup',
  LOGIN: 'login',
  OTP: 'verifyOTP',
  FORGET_PASSWORD: 'forgetPassword',
  RESET_PASSWORD: 'resetPassword',
  VERIFY_FORGET_REQUEST: ({email,otp}) => `verifyOTPForPassword?email=${email}&OTP=${otp}`,
  CREATE_UPDATE_PROFILE: 'updateUser',
  GET_PROFILE: (id) => `getProfile?userId=${id}`

}