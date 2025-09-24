import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL, endpoints } from '../constant';

export const Apis = createApi({
  reducerPath: 'Apis',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().persistedData.token;
      console.log('state ===>', token);
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: builder => ({
    register: builder.mutation({
      query: data => ({
        url: endpoints.SIGNUP,
        method: 'POST',
        body: data,
      }),
    }),
    login: builder.mutation({
      query: data => ({
        url: endpoints.LOGIN,
        method: 'POST',
        body: data,
      }),
    }),
    forgetPassword: builder.mutation({
      query: data => ({
        url: endpoints.FORGET_PASSWORD,
        method: 'POST',
        body: data,
      }),
    }),
    verifyOTP: builder.mutation({
      query: data => {
        return {
          url: endpoints.OTP,
          method: 'POST',
          body: data,
        };
      },
    }),
    verifyOTPPassword: builder.query({
      query: ({email,otp}) => {
        return {
          url: endpoints.VERIFY_FORGET_REQUEST({email,otp}),
          method: 'GET',
        };
      },
    }),
    createUpdateProfile: builder.mutation({
      query: data => {
        return {
          url: endpoints.CREATE_UPDATE_PROFILE,
          method: 'POST',
          body: data,
        };
      },
    }),
    resetPassword: builder.mutation({
      query: data => ({
        url: endpoints.RESET_PASSWORD,
        method: 'POST',
        body: data,
      }),
    }),
    getProfile: builder.query({
      query: id => {
        //   console.log('typeeee',type)
        return {
          url: endpoints.GET_PROFILE(id),
          method: 'GET',
        };
      },
    }),
     getAllAppointments: builder.query({
      query: (id,type) => {
        //   console.log('typeeee',type)
        return {
          url: endpoints.GET_ALL_APPOINTMENTS(id,type),
          method: 'GET',
        };
      },
    }),
     getNearbyTechnicians: builder.query({
      query: ({lat,long,service}) => {
        //   console.log('typeeee',type)
        return {
          url: endpoints.GET_NEARBY_TECHNICIANS({lat,long,service}),
          method: 'GET',
        };
      },
    }),
    //  getAllServices: builder.query({
    //   query: () => {
    //     //   console.log('typeeee',type)
    //     return {
    //       url: endpoints.GET_ALL_SERVICES,
    //       method: 'GET',
    //     };
    //   },
    // }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useForgetPasswordMutation,
  useVerifyOTPMutation,
  useResetPasswordMutation,
  useLazyGetProfileQuery,
  useLazyVerifyOTPPasswordQuery,
  useCreateUpdateProfileMutation,
  useLazyGetAllAppointmentsQuery,
  useLazyGetNearbyTechniciansQuery,
  // useLazyGetAllServicesQuery
} = Apis;
