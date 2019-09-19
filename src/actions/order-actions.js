/**
 * Copyright 2019
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

import { authErrorHandler } from "openstack-uicore-foundation/lib/methods";
import T from "i18n-react/dist/i18n-react";
import history from '../history'
import validator from "validator"


import {
    getRequest,
    putRequest,
    postRequest,
    createAction,
    stopLoading,
    startLoading,
    showMessage,
    showSuccessMessage,    
} from 'openstack-uicore-foundation/lib/methods';


export const RESET_ORDER                    = 'RESET_ORDER';
export const RECEIVE_ORDER                  = 'RECEIVE_ORDER';
export const CHANGE_ORDER                   = 'CHANGE_ORDER';
export const VALIDATE_STRIPE                = 'VALIDATE_STRIPE';
export const CREATE_RESERVATION             = 'CREATE_RESERVATION';
export const CREATE_RESERVATION_SUCCESS     = 'CREATE_RESERVATION_SUCCESS';
export const CREATE_RESERVATION_ERROR       = 'CREATE_RESERVATION_ERROR';
export const PAY_RESERVATION                = 'PAY_RESERVATION';
export const GET_USER_ORDERS                = 'GET_ORDERS';
export const SELECT_ORDER                   = 'SELECT_ORDER';

export const handleResetOrder = () => (dispatch, getState) => {
    dispatch(createAction(RESET_ORDER)({}));
}

const stepDefs = ['start', 'details', 'checkout', 'done'];

export const handleOrderChange = (order, errors = {}) => (dispatch, getState) => {

    let {currentStep} = order;

    if(currentStep === 2) {
        if (validator.isEmpty(order.first_name)) errors.first_name = 'Please enter your First Name.';
        if (validator.isEmpty(order.last_name)) errors.last_name = 'Please enter your Last Name.';
        if (!validator.isEmail(order.email)) errors.email = 'Please enter a valid Email.';
        if (validator.isEmpty(order.company)) errors.company = 'Please enter your Company.';

        order.tickets.forEach(tix => {
           if (tix.coupon && tix.coupon.code == 'NOTACOUPON') errors[`tix_coupon_${tix.id}`] = 'Coupon not valid.';
           else delete(errors[`tix_coupon_${tix.id}`]);

           if (tix.email && !validator.isEmail(tix.email)) errors[`tix_email_${tix.id}`] = 'Please enter a valid Email.';
           else delete(errors[`tix_email_${tix.id}`]);
        });        
        dispatch(createAction(CHANGE_ORDER)({order, errors}));
    } else if(currentStep === 3) {     
        if (validator.isEmpty(order.billing_country)) errors.billing_country = "Please enter the billing Country.";
        if (validator.isEmpty(order.billing_address)) errors.billing_address = "Please enter the billing Address.";
        if (validator.isEmpty(order.billing_city)) errors.billing_city = "Please enter the billing City.";
        if (validator.isEmpty(order.billing_state)) errors.billing_state = "Please enter the billing State.";
        if (validator.isEmpty(order.billing_zipcode)) errors.billing_zipcode = "Please enter the billing ZipCode.";
        dispatch(createAction(CHANGE_ORDER)({order, errors}));
    } else {
        dispatch(createAction(CHANGE_ORDER)({order, errors}));
    }

}

export const validateStripe = (value) => (dispatch, getState) => {
    dispatch(createAction(VALIDATE_STRIPE)({value}));
}

export const createReservation = (owner_email, owner_first_name, owner_last_name, owner_company, tickets) => (dispatch, getState) => {
    let { summitState } = getState();    
    let { currentSummit }   = summitState;

    dispatch(startLoading());
    
    let normalizedEntity = {owner_email, owner_first_name, owner_last_name, owner_company, tickets };

    return postRequest(
        createAction(CREATE_RESERVATION),
        createAction(CREATE_RESERVATION_SUCCESS),        
        `${window.API_BASE_URL}/api/public/v1/summits/${currentSummit.id}/orders/reserve`,
        normalizedEntity,
        authErrorHandler,
        // entity
    )()(dispatch)
        .then((payload) => {
            dispatch(stopLoading());
            history.push(stepDefs[2]);
            return (payload)
        })
        .catch(e => {
            dispatch(createAction(CREATE_RESERVATION_ERROR)(e));
            return (e);
        })
}

export const payReservation = (card, stripe) => (dispatch, getState) => {
    let {orderState: {order, reservation}, summitState: {currentSummit}} = getState();

    let success_message = {
        title: T.translate("general.done"),
        html: T.translate("book_meeting.reservation_created"),
        type: 'success'
    };

    dispatch(startLoading());
    
    stripe.handleCardPayment(
      reservation.payment_gateway_client_token, card, {
            payment_method_data: {
                billing_details: {name: `${order.first_name} ${order.last_name}`}
            }
        }
    ).then((result) => {
        if (result.error) {
            // Display error.message in your UI.
            dispatch(stopLoading());
            console.log('error', error);
        } else {
            console.log('result', result);
            console.log('checking order', order);
            let normalizedEntity = {
                billing_address_1: order.billing_address,
                billing_address_2: order.billing_address_two,
                billing_address_zip_code: order.billing_zipcode,
                billing_address_city: order.billing_city,
                billing_address_state: order.billing_state,
                billing_address_country: order.billing_country
            };            
            return putRequest(
                null,
                createAction(PAY_RESERVATION),
                `${window.API_BASE_URL}/api/public/v1/summits/${currentSummit.id}/orders/${reservation.hash}/checkout`,
                normalizedEntity,
                authErrorHandler,
                // entity
            )()(dispatch)
                .then((payload) => {
                    dispatch(stopLoading());
                    console.log('success', payload);
                    history.push(stepDefs[3]);
                    return (payload);
                })
                .catch(e => {
                    dispatch(stopLoading());                    
                    console.log('error', e);
                    return (e);
                });
            // The payment has succeeded. Display a success message.
        }
    })
    .catch(e => console.log('error', e));
}

export const getUserOders = () => (dispatch, getState) => {
  
  let { loggedUserState } = getState();
  let { accessToken }     = loggedUserState;
  
  dispatch(startLoading());

  let params = {
      access_token : accessToken,
      expand       : 'tickets',
  };
  
  return getRequest(
      null,
      createAction(GET_USER_ORDERS),
      `${window.API_BASE_URL}/api/v1/summits/all/orders/me`,
      authErrorHandler
  )(params)(dispatch).then(() => {
      dispatch(stopLoading());
    }
  );

}

export const selectOrder = (order) => (dispatch, getState) => {
    
  dispatch(startLoading());

  dispatch(createAction(SELECT_ORDER)(order));

  dispatch(stopLoading());

}




