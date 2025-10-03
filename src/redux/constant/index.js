export const BASE_URL = 'https://appsdemo.pro/Serbi-Backend/api/user/';
export const IMAGE_URL = 'https://appsdemo.pro/Serbi-Backend/';
export const ADMIN_URL = 'https://appsdemo.pro/Serbi-Backend/api/admin/';

export const endpoints = {
  SIGNUP: 'signup',
  LOGIN: 'login',
  OTP: 'verifyOTP',
  FORGET_PASSWORD: 'forgetPassword',
  RESET_PASSWORD: 'resetPassword',
  VERIFY_FORGET_REQUEST: ({ email, otp }) =>
    `verifyOTPForPassword?email=${email}&OTP=${otp}`,
  CREATE_UPDATE_PROFILE: 'updateUser',
  GET_PROFILE: id => `getProfile?userId=${id}`,
  GET_ALL_APPOINTMENTS: (id, type) =>
    `getAllRequestForms?${type === 'user' ? 'userId' : 'technicianId'}=${id}`,
  GET_NEARBY_TECHNICIANS: ({ lat, long, service }) =>
    `nearbyUsers?longitude=${long}&latitude=${lat}&service=${service}`,
  GET_ALL_SERVICES: 'getAllServices',
  ADD_TO_FAVOURITES: 'addToFavorites',
  GET_WISHLISTS: id => `getAllFavorites?userId=${id}`,
  REQUEST_FORM: 'createRequestForm',
  ADD_REVIEW: 'addReview'
};
