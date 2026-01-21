import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ADMIN_URL, endpoints } from '../constant';

export const AdminApis = createApi({
  reducerPath: 'AdminApis',
  baseQuery: fetchBaseQuery({
    baseUrl: ADMIN_URL,
    // prepareHeaders: (headers, { getState }) => {
    //   const token = getState().persistedData.token;
    //   console.log('state ===>', token);
    //   if (token) {
    //     headers.set('authorization', `Bearer ${token}`);
    //   }
    //   return headers;
    // },
  }),
  endpoints: builder => ({
    getAllServices: builder.query({
      query: () => {
        //   console.log('typeeee',type)
        return {
          url: endpoints.GET_ALL_SERVICES,
          method: 'GET',
        };
      },
    }),
    allServices: builder.query({
      query: () => {
        //   console.log('typeeee',type)
        return {
          url: endpoints.GET_ALL_SERVICES,
          method: 'GET',
        };
      },
    }),
  }),
});

export const { useLazyGetAllServicesQuery, useLazyAllServicesQuery } =
  AdminApis;
