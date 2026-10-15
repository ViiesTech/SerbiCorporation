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
    getCommission: builder.query({
      query: () => ({
        url: endpoints.GET_COMMISSION,
        method: 'GET',
      }),
      providesTags: ['Commission'],
    }),
    updateCommission: builder.mutation({
      query: data => ({
        url: endpoints.UPDATE_COMMISSION,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Commission'],
    }),
  }),
});

export const {
  useLazyGetAllServicesQuery,
  useLazyAllServicesQuery,
  useLazyAllPropertyTypesQuery,
  useGetCommissionQuery,
  useLazyGetCommissionQuery,
  useUpdateCommissionMutation,
} = AdminApis;
