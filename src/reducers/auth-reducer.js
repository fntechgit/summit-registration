/**
 * Copyright 2020 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import {
  CLOSE_SIGNIN_MODAL,
  FINISH_PASSWORDLESS_LOGIN,
  GET_THIRD_PARTY_PROVIDERS,
  GO_TO_LOGIN,
  LOGIN_START_LOADING,
  LOGIN_STOP_LOADING,
  OPEN_SIGNIN_MODAL,
  SET_AUTHORIZED_USER,
  SET_PASSWORDLESS_LOGIN,
  SET_PASSWORDLESS_LENGTH,
  SET_PASSWORDLESS_ERROR,
  OPEN_WILL_LOGOUT_MODAL,
  CLOSE_WILL_LOGOUT_MODAL,
  CLEAR_AUTH_STATE,
} from "../actions/auth-actions";

import {RESET_STATE} from "../actions/base-actions";
import {LOGOUT_USER, SET_LOGGED_USER} from "openstack-uicore-foundation/lib/actions";

const DEFAULT_STATE = {
  allows_native_auth: false,
  allows_otp_auth: false,
  signInModalOpened: false,
  logoutModalOpened: false,
  isAuthorized: false,
  loading: false,
  third_party_providers: null,
  passwordless: {
    email: null,
    otp_length: 0,
    code_sent: false,
    error: false,
  },
};

const AuthReducer = (state = DEFAULT_STATE, action) => {
  const { type, payload } = action;
  switch (type) {
    case RESET_STATE:
    case LOGOUT_USER:
      return DEFAULT_STATE;
    case SET_LOGGED_USER:
    case CLEAR_AUTH_STATE:{
      return { ...state, logoutModalOpened: false, signInModalOpened: false, loading:false };
    }
    case LOGIN_START_LOADING: {
      return { ...state, loading: true };
    }
    case LOGIN_STOP_LOADING: {
      return { ...state, loading: false };
    }
    case OPEN_SIGNIN_MODAL: {
      return { ...state, signInModalOpened: true };
    }
    case CLOSE_SIGNIN_MODAL: {
      return { ...state, signInModalOpened: false };
    }
    case FINISH_PASSWORDLESS_LOGIN: {
      return {
        ...state,
        signInModalOpened: false,
        passwordless: { ...DEFAULT_STATE.passwordless },
      };
    }
    case GO_TO_LOGIN: {
      return {
        ...state,
        passwordless: { ...state.passwordless, code_sent: false, error: false },
      };
    }
    case SET_PASSWORDLESS_LOGIN: {
      return {
        ...state,
        passwordless: { ...state.passwordless, email: payload, error: false },
      };
    }
    case SET_PASSWORDLESS_LENGTH: {
      const { otp_length } = payload;
      return {
        ...state,
        passwordless: {
          ...state.passwordless,
          otp_length,
          code_sent: true,
          error: false,
        },
      };
    }
    case SET_PASSWORDLESS_ERROR: {
      return { ...state, passwordless: { ...state.passwordless, error: true } };
    }
    case GET_THIRD_PARTY_PROVIDERS: {
      const { allows_native_auth, allows_otp_auth, third_party_identity_providers } = payload.response;
      return { ...state, loading: false, allows_native_auth, allows_otp_auth, third_party_providers: third_party_identity_providers };
    }
    case SET_AUTHORIZED_USER:
      return { ...state, isAuthorized: payload };
    case OPEN_WILL_LOGOUT_MODAL: {
      return { ...state, logoutModalOpened: true };
    }
    case CLOSE_WILL_LOGOUT_MODAL: {
      return { ...state, logoutModalOpened: false };
    }
    default: {
      return state;
    }
  }
};

export default AuthReducer;
