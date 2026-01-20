export const BASE_URL = 'https://appsdemo.pro/Serbi-Backend/api/user/';
// export const BASE_URL = 'http://192.168.100.168:4030/api/user/'
export const IMAGE_URL = 'https://appsdemo.pro/Serbi-Backend/';
export const ADMIN_URL = 'https://appsdemo.pro/Serbi-Backend/api/admin/';
export const MAP_API_KEY = 'AIzaSyD_u0v13rRdMLo4ZpwsSfhT4dGTzcIwXf4'
export const CLIENT_ID = '584277279555-h1kfoqno737uv4fenrlrcb9felcvhuee.apps.googleusercontent.com'
export const IOS_CLIENT_ID = '584277279555-5j8a1natp1rpi4dutp1r8fn24p3aovd6.apps.googleusercontent.com'
// export const CLIENT_ID = '584277279555-h1kfoqno737uv4fenrlrcb9felcvhuee.apps.googleusercontent.com'
export const STRIPE_KEY = 'pk_test_51SVf2OKEUCMHl0MN7pbyBpYvNlmK5LXpZH0NkS2VVdomB9DX9AwOLjXDsrYfBMYJEvfRjzYVzAC22s1OzqEaT3Gl00yDgNXjqn'
export const PDF_URL = 'https://appsdemo.pro/Serbi-Backend/public/license/'

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
    `getAllRequestForms?${type === 'User' ? 'userId' : 'technicianId'}=${id}`,
  GET_NEARBY_TECHNICIANS: ({ lat, long, service }) =>
    `nearbyUsers?longitude=${long}&latitude=${lat}&service=${service}`,
  GET_ALL_SERVICES: 'getAllServices',
  ADD_TO_FAVOURITES: 'addToFavorites',
  GET_WISHLISTS: id => `getAllFavorites?userId=${id}`,
  REQUEST_FORM: 'createRequestForm',
  ADD_REVIEW: 'addReview',
  DISCUSS_FORM: 'createDiscussionForm',
  GET_DISCUSSION_FORMS: (id, type, status) =>
    `getAllDiscussionForms?${
      type === 'User' ? 'userId' : 'technicianId'
    }=${id}&status=${status}`,
  UPDATE_DISCUSSION_FORMS: 'updateDiscussionForm',
  GET_ALL_REVIEWS: (id) => `getAllReviews?technicianId=${id}`,
  GET_APPOINTMENT_DETAIL: (id) => `getRequestFormById?formId=${id}`,
  UPDATE_APPOINTMENT: 'updateRequestForm',
  GOOGLE_LOGIN: 'googleLogin',
  SET_USER_TYPE: 'setUserType',
  CREATE_SETUP_INTENT: 'createSetupIntent',
  SAVE_CARD: 'savePaymentMethod',
  CREATE_PAYMENT: 'createPayment',
  GET_ALL_CARDS:'getSavedCards'
};
