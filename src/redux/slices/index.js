import { createSlice } from '@reduxjs/toolkit';
import { Apis } from '../services';

const initialState = {
  token: '',
  user: {},
  firstVisit: false,
};

export const Slice = createSlice({
  name: 'Slice',
  initialState,
  reducers: {
    resetUser: state => {
      (state.user = {}), (state.token = null);
    },
    firstTimeVisit: (state, action) => {
      state.firstVisit = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addMatcher(
      Apis.endpoints.verifyOTP.matchFulfilled,
      (state, action) => {
        if (action.payload?.data) {
          state.user = action.payload.data;
          state.token = action.payload?.accessToken;
        }
      },
    ),
      builder.addMatcher(
        Apis.endpoints.login.matchFulfilled,
        (state, action) => {
          if (action.payload?.data) {
            state.user = action.payload.data;
            state.token = action.payload?.accessToken;
          }
        },
      ),
      builder.addMatcher(
        Apis.endpoints.createUpdateProfile.matchFulfilled,
        (state, action) => {
          // console.log('user data',state.user)
          if (action.payload?.data) {
            state.user = {
              ...state.user,
              ...action.payload.data,
            };
          }
        },
      );
  },
});

export const {firstTimeVisit,resetUser} = Slice.actions;

export default Slice.reducer;
