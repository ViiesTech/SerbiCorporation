import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ADMIN_URL, endpoints } from '../constant';

export const AdminApis = createApi({
  reducerPath: 'AdminApis',
  baseQuery: fetchBaseQuery({
    baseUrl: ADMIN_URL,
  }),
  endpoints: builder => ({
    getAllServices: builder.query({
      query: () => {
        return {
          url: endpoints.GET_ALL_SERVICES,
          method: 'GET',
        };
      },
    }),
    allServices: builder.query({
      query: () => {
        return {
          url: endpoints.GET_ALL_SERVICES,
          method: 'GET',
        };
      },
    }),
    allPropertyTypes: builder.query({
      query: () => {
        return {
          url: endpoints.GET_ALL_PROPERTY_TYPES,
          method: 'GET',
        };
      },
    }),
  }),
});

export const {
  useLazyGetAllServicesQuery,
  useLazyAllServicesQuery,
  useLazyAllPropertyTypesQuery,
} = AdminApis;
