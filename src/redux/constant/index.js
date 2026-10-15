// export const BASE_URL = 'https://appsdemo.pro/Serbi-Backend/api/user/';
export const BASE_URL = 'https://serbi.apiforapp.link/api/user/';
// export const BASE_URL = 'http://192.168.100.168:4030/api/user/'
export const IMAGE_URL = 'https://serbi.apiforapp.link/';
export const ADMIN_URL = 'https://serbi.apiforapp.link/api/admin/';
export const MAP_API_KEY = 'AIzaSyCq9nyeDdwfJJg5z5se51OxsL19aW4-Vdo';
export const MAP_API_KEY_IOS = 'AIzaSyCvGycVuu5ijiVfMj6ASBIvJ8oGBrVwmUc';
export const CLIENT_ID =
  '584277279555-h1kfoqno737uv4fenrlrcb9felcvhuee.apps.googleusercontent.com';
export const IOS_CLIENT_ID =
  '584277279555-5j8a1natp1rpi4dutp1r8fn24p3aovd6.apps.googleusercontent.com';
// export const STRIPE_KEY =
//   'pk_test_51SVf2OKEUCMHl0MN7pbyBpYvNlmK5LXpZH0NkS2VVdomB9DX9AwOLjXDsrYfBMYJEvfRjzYVzAC22s1OzqEaT3Gl00yDgNXjqn';
export const STRIPE_KEY =
  'pk_test_51SfTtF0wu2sgmNi0bNOv7loJaKHXP9TpnoRQGzaGkolE5zIKes1Kkd0aBVfadwRuLtIemwdZCS0Q5Qt3cw3rt8u700f7Eemxdd';
export const PDF_URL = 'https://serbi.apiforapp.link/public/license/';
export const SOCKET_URL = 'https://serbi.apiforapp.link';

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
  GET_ALL_REVIEWS: id => `getAllReviews?technicianId=${id}`,
  GET_APPOINTMENT_DETAIL: id => `getRequestFormById?formId=${id}`,
  UPDATE_APPOINTMENT: 'updateRequestForm',
  GOOGLE_LOGIN: 'googleLogin',
  SET_USER_TYPE: 'setUserType',
  CREATE_SETUP_INTENT: 'createSetupIntent',
  SAVE_CARD: 'savePaymentMethod',
  CREATE_PAYMENT: 'createPayment',
  GET_ALL_CARDS: 'getSavedCards',
  GET_ALL_PROPERTY_TYPES: 'getAllPropertyTypes',
  SEND_MESSAGE: 'sendMessage',
  GET_MESSAGES: ({ otherUserId, limit = 20, cursor }) => {
    let url = `getMessages?otherUserId=${otherUserId}&limit=${limit}`;
    if (cursor) {
      url += `&cursor=${cursor}`;
    }
    return url;
  },
  GET_INBOX: ({ page = 1, limit = 20 } = {}) =>
    `getInbox?page=${page}&limit=${limit}`,
  MARK_MESSAGES_READ: 'markMessagesAsRead',
  REGISTER_DEVICE_TOKEN: 'registerDeviceToken',
  LOGOUT: 'logout',
  GET_NOTIFICATIONS: ({ page = 1, limit = 20 } = {}) =>
    `getNotifications?page=${page}&limit=${limit}`,
  READ_NOTIFICATION: 'readNotification',
  STRIPE_CONNECT_ONBOARDING: 'stripeConnect/createOnboardingLink',
  STRIPE_CONNECT_STATUS: 'stripeConnect/status',
  STRIPE_CONNECT_DASHBOARD: 'stripeConnect/dashboardLink',
  GET_COMMISSION: 'getCommission',
  UPDATE_COMMISSION: 'updateCommission',
};

