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
  authErrorHandler,
  createAction,
  getRequest,
  getUserInfo,
  startLoading,
  stopLoading,
  passwordlessLogin,
  passwordlessStart,
} from "openstack-uicore-foundation/lib/methods";

export const CLOSE_SIGNIN_MODAL         = "CLOSE_SIGNIN_MODAL";
export const FINISH_PASSWORDLESS_LOGIN  = "FINISH_PASSWORDLESS_LOGIN";
export const GET_THIRD_PARTY_PROVIDERS  = "GET_THIRD_PARTY_PROVIDERS";
export const GO_TO_LOGIN                = "GO_TO_LOGIN";
export const LOGIN_START_LOADING        = "LOGIN_START_LOADING";
export const LOGIN_STOP_LOADING         = "LOGIN_STOP_LOADING";
export const OPEN_SIGNIN_MODAL          = "OPEN_SIGNIN_MODAL";
export const SET_AUTHORIZED_USER        = "SET_AUTHORIZED_USER";
export const SET_PASSWORDLESS_ERROR     = "SET_PASSWORDLESS_ERROR";
export const SET_PASSWORDLESS_LENGTH    = "SET_PASSWORDLESS_LENGTH";
export const SET_PASSWORDLESS_LOGIN     = "SET_PASSWORDLESS_LOGIN";
export const OPEN_WILL_LOGOUT_MODAL     = "OPEN_WILL_LOGOUT_MODAL";
export const CLOSE_WILL_LOGOUT_MODAL    = "CLOSE_WILL_LOGOUT_MODAL";

export const goToLogin = () => (dispatch) => {
  dispatch(createAction(GO_TO_LOGIN)());
};

export const openSignInModal = () => (dispatch) => {
  dispatch(createAction(OPEN_SIGNIN_MODAL)());
};

export const closeSignInModal = () => (dispatch) => {
  dispatch(createAction(CLOSE_SIGNIN_MODAL)());
};

export const openWillLogoutModal = () => (dispatch) => {
  dispatch(createAction(OPEN_WILL_LOGOUT_MODAL)());
};

export const closeWillLogoutModal = () => (dispatch) => {
  dispatch(createAction(CLOSE_WILL_LOGOUT_MODAL)());
};

export const getLoginCode = (email) => async (dispatch) => {
  dispatch(createAction(SET_PASSWORDLESS_LOGIN)(email));
  dispatch(createAction(LOGIN_START_LOADING)());

  const params = {
    connection: "email",
    send: "code",
    email,
  };

  return passwordlessStart(params)
    .then((res) => {
      dispatch(createAction(SET_PASSWORDLESS_LENGTH)(res.response));
      dispatch(createAction(LOGIN_STOP_LOADING)());
    })
    .catch((e) => {
      dispatch(createAction(LOGIN_STOP_LOADING)());
    });
};

export const getThirdPartyProviders = () => (dispatch) => {
  dispatch(startLoading());

  return getRequest(
    null,
    createAction(GET_THIRD_PARTY_PROVIDERS),
    `${window.IDP_BASE_URL}/oauth2/.well-known/openid-configuration`,
    authErrorHandler
  )({})(dispatch)
    .then((payload) => {
      dispatch(stopLoading());
      return payload;
    })
    .catch((e) => {
      dispatch(stopLoading());
      return e;
    });
};

export const pwdlessLogin =
  (code, loginWithCode) => async (dispatch, getState) => {
    const {
      authState: {
        passwordless: { email },
      },
    } = getState();

    return new Promise((resolve, reject) => {
      dispatch(createAction(LOGIN_START_LOADING)());
      loginWithCode(code, email).then(
        (res) => {
          if (res) {
            dispatch(createAction(SET_PASSWORDLESS_ERROR)());
          }
          dispatch(createAction(LOGIN_STOP_LOADING)());
          resolve(res);
        },
        (err) => {
          dispatch(createAction(LOGIN_STOP_LOADING)());
          reject(err);
        }
      );
    });
  };

export const setPasswordlessLogin = (params) => (dispatch, getState) => {
  return dispatch(passwordlessLogin(params)).then(
    (res) => {
      //console.log("setPasswordlessLogin", res);
      return getUserInfo()(dispatch, getState).then(() => {
        dispatch(createAction(FINISH_PASSWORDLESS_LOGIN)());
      });
    },
    (err) => {
      return Promise.resolve(err);
    }
  );
};
