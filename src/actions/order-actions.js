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

import T from "i18n-react/dist/i18n-react";
import history from '../history'
import validator from "validator"
import Swal from 'sweetalert2';
import {
    authErrorHandler,
    getAccessToken,
    getRequest,
    putRequest,
    postRequest,
    deleteRequest,
    createAction,
    stopLoading,
    startLoading,
    getIdToken
} from 'openstack-uicore-foundation/lib/methods';

import IdTokenVerifier from 'idtoken-verifier';

import {getUserSummits} from './summit-actions';
import {openWillLogoutModal} from "./auth-actions";
import {stepDefs} from '../global/constants';
import { updateProfile } from "./user-actions";

export const RESET_ORDER = 'RESET_ORDER';
export const RECEIVE_ORDER = 'RECEIVE_ORDER';
export const CHANGE_ORDER = 'CHANGE_ORDER';
export const VALIDATE_STRIPE = 'VALIDATE_STRIPE';
export const CREATE_RESERVATION = 'CREATE_RESERVATION';
export const CREATE_RESERVATION_SUCCESS = 'CREATE_RESERVATION_SUCCESS';
export const CREATE_RESERVATION_ERROR = 'CREATE_RESERVATION_ERROR';
export const DELETE_RESERVATION = 'DELETE_RESERVATION';
export const DELETE_RESERVATION_SUCCESS = 'DELETE_RESERVATION_SUCCESS';
export const DELETE_RESERVATION_ERROR = 'DELETE_RESERVATION_ERROR';
export const PAY_RESERVATION = 'PAY_RESERVATION';
export const GET_USER_ORDERS = 'GET_ORDERS';
export const SELECT_ORDER = 'SELECT_ORDER';
export const REFUND_ORDER = 'REFUND_ORDER';
export const CLEAR_RESERVATION = 'CLEAR_RESERVATION';

export const handleResetOrder = (step = null) => (dispatch, getState) => {
    dispatch(createAction(RESET_ORDER)({step: step}));
}

export const checkOrderData = () => (dispatch, getState) => {

  const { loggedUserState: {member: {first_name, last_name}}} = getState();
  const { orderState: { purchaseOrder: {reservation: { owner_company, owner_first_name, owner_last_name }}}} = getState();  

  const idToken = getIdToken();
  let company = '';  
  if(idToken) {
    try {
      const verifier = new IdTokenVerifier();
      let jwt = verifier.decode(idToken);      
      company = jwt.payload.company;      
    }
    catch (e){
      console.log('error', e);      
    }
  }  

  if (owner_company !== company || owner_first_name !== first_name || owner_last_name !== last_name) {
      const newProfile = {
          first_name: owner_first_name,
          last_name: owner_last_name,
          company: owner_company
      };
      dispatch(updateProfile(newProfile));
  }

  dispatch(createAction(CLEAR_RESERVATION)({}));
}

export const handleOrderChange = (order, errors = {}) => (dispatch, getState) => {
    let {currentStep} = order;

    if (currentStep === 2) {
        if (validator.isEmpty(order.first_name)) errors.first_name = T.translate("step_two.validator.first_name");
        if (validator.isEmpty(order.last_name)) errors.last_name = T.translate("step_two.validator.last_name");
        if (validator.isEmpty(order.company)) errors.company = T.translate("step_two.validator.company");
        if (!validator.isEmail(order.email)) errors.email = T.translate("step_two.validator.email");

        order.tickets.forEach(tix => {
            //  if (tix.promo_code && tix.promo_code == 'NOTACOUPON') errors[`tix_coupon_${tix.tempId}`] = 'Coupon not valid.';
            //  else delete(errors[`tix_coupon_${tix.tempId}`]);

            if (tix.attendee_email && !validator.isEmail(tix.attendee_email)) errors[`tix_email_${tix.tempId}`] = T.translate("step_two.validator.email");
            else delete (errors[`tix_email_${tix.tempId}`]);
        });
        dispatch(createAction(CHANGE_ORDER)({order, errors}));
    } else if (currentStep === 3) {
        // if (validator.isEmpty(order.billing_country)) errors.billing_country = T.translate("step_three.validator.billing_country");
        // if (validator.isEmpty(order.billing_address)) errors.billing_address = T.translate("step_three.validator.billing_address");
        // if (validator.isEmpty(order.billing_city)) errors.billing_city = T.translate("step_three.validator.billing_city");
        // if (validator.isEmpty(order.billing_state)) errors.billing_state = T.translate("step_three.validator.billing_state");
        if (validator.isEmpty(order.billing_zipcode)) errors.billing_zipcode = T.translate("step_three.validator.billing_zipcode");
        dispatch(createAction(CHANGE_ORDER)({order, errors}));
    } else {
        dispatch(createAction(CHANGE_ORDER)({order, errors}));
    }
}

export const validateStripe = (value) => (dispatch, getState) => {
    dispatch(createAction(VALIDATE_STRIPE)({value}));
}

export const createReservation = (owner_email, owner_first_name, owner_last_name, owner_company, tickets) => async (dispatch, getState) => {
    const accessToken = await getAccessToken().catch(_ => dispatch(openWillLogoutModal()));
    if (!accessToken) return;

    let {summitState} = getState();
    let {purchaseSummit} = summitState;

    dispatch(startLoading());

    tickets = tickets.map(t => {

        t.type_id = t.type_id ? t.type_id : t.ticket_type_id;
        Object.keys(t).forEach((key) => {
            if (key !== "type_id" && key !== "promo_code" && key !== "attendee_email") delete t[key];
        });

        if (t.attendee_email === owner_email) {
            t.attendee_first_name = owner_first_name;
            t.attendee_last_name = owner_last_name;
            t.attendee_company = owner_company;
        }

        return t;
    });

    let endpoint = accessToken ?
        `${window.API_BASE_URL}/api/v1/summits/${purchaseSummit.id}/orders/reserve` :
        `${window.API_BASE_URL}/api/public/v1/summits/${purchaseSummit.id}/orders/reserve`;

    let params = {
        expand: 'tickets,tickets.owner',
    };

    if (accessToken) {
        params['access_token'] = accessToken;
    }

    let normalizedEntity = {owner_email, owner_first_name, owner_last_name, owner_company, tickets};

    return postRequest(
        createAction(CREATE_RESERVATION),
        createAction(CREATE_RESERVATION_SUCCESS),
        endpoint,
        normalizedEntity,
        authErrorHandler,
        // entity
    )(params)(dispatch)
        .then((payload) => {
            dispatch(stopLoading());
            const isFree = payload.response.discount_amount === payload.response.raw_amount;
            const hasTicketExtraQuestion = purchaseSummit.order_extra_questions.filter((q) => q.usage === 'Ticket' || q.usage === 'Both').length > 0;
            const mandatoryDisclaimer = purchaseSummit.registration_disclaimer_mandatory;
            if (isFree) {
                if (hasTicketExtraQuestion || mandatoryDisclaimer) {
                    history.push(stepDefs[3]);
                } else {
                    dispatch(payReservation());
                }
            } else {
                history.push(stepDefs[2]);
            }
            return (payload)
        })
        .catch(e => {
            dispatch(createAction(CREATE_RESERVATION_ERROR)(e));
            dispatch(stopLoading());
            return (e);
        })
}

export const deleteReservation = () => (dispatch, getState) => {

    let {summitState, orderState} = getState();
    let {purchaseSummit: {id}} = summitState;
    let {purchaseOrder: {reservation: {hash}}} = orderState;

    return deleteRequest(
        createAction(DELETE_RESERVATION),
        createAction(DELETE_RESERVATION_SUCCESS),
        `${window.API_BASE_URL}/api/public/v1/summits/${id}/orders/${hash}`,
        {},
        authErrorHandler,
        // entity
    )({})(dispatch)
        .then((payload) => {
            dispatch(stopLoading());
            return (payload)
        })
        .catch(e => {
            dispatch(createAction(DELETE_RESERVATION_ERROR)(e));
            dispatch(stopLoading());
            return (e);
        })
}

export const payReservation = (token = null, stripe = null) => (dispatch, getState) => {

    let {orderState: {purchaseOrder, purchaseOrder: {reservation}}, summitState: {purchaseSummit}} = getState();

    let success_message = {
        title: T.translate("general.done"),
        html: T.translate("book_meeting.reservation_created"),
        type: 'success'
    };

    let hasTicketExtraQuestion = purchaseSummit.order_extra_questions.filter((q) => q.usage === 'Ticket' || q.usage === 'Both').length > 0;
    let mandatoryDisclaimer = purchaseSummit.registration_disclaimer_mandatory;

    let params = {
        expand: 'tickets',
    };

    dispatch(startLoading());

    if(!token && !stripe) {
      let normalizedEntity = {
        billing_address_1: purchaseOrder.billing_address,
        billing_address_2: purchaseOrder.billing_address_two,
        billing_address_zip_code: purchaseOrder.billing_zipcode,
        billing_address_city: purchaseOrder.billing_city,
        billing_address_state: purchaseOrder.billing_state,
        billing_address_country: purchaseOrder.billing_country
      };

      return putRequest(
          null,
          createAction(PAY_RESERVATION),
          `${window.API_BASE_URL}/api/public/v1/summits/${purchaseSummit.id}/orders/${reservation.hash}/checkout`,
          normalizedEntity,
          authErrorHandler,
          // entity
      )(params)(dispatch).then((payload) => {                    
              dispatch(stopLoading());
              // if the order is free, the evaluation to the extra questions page was performed on the previous step
              const isFree = payload.response.discount_amount === payload.response.raw_amount;
              if(isFree) {
                dispatch(checkOrderData());
                history.push(stepDefs[4]);
                return (payload);
            } else if (reservation.hasOwnProperty('tickets') && reservation.tickets.length <= window.MAX_TICKET_QTY_TO_EDIT && (hasTicketExtraQuestion || mandatoryDisclaimer)) {
                // if we reach the required qty of tix to update and we have extra questions for tix ..
                  dispatch(checkOrderData());
                  history.push(stepDefs[3]);
                  return (payload);
              } else {
              dispatch(checkOrderData());
              history.push(stepDefs[4]);
              return (payload);
              }              
          })
          .catch(e => {
              dispatch(stopLoading());
              return (e);
          });
    } else {
        const {id} = token;
        stripe.confirmCardPayment(
            reservation.payment_gateway_client_token, {
                payment_method: {card: {token: id}}
            }
        ).then((result) => {
            if (result.error) {
                // Reserve error.message in your UI.
                Swal.fire(result.error.message, "Please retry purchase.", "warning");
                history.push(stepDefs[1]);
                dispatch(stopLoading());
            } else {
                let normalizedEntity = {
                    billing_address_1: purchaseOrder.billing_address,
                    billing_address_2: purchaseOrder.billing_address_two,
                    billing_address_zip_code: purchaseOrder.billing_zipcode,
                    billing_address_city: purchaseOrder.billing_city,
                    billing_address_state: purchaseOrder.billing_state,
                    billing_address_country: purchaseOrder.billing_country
                };

                return putRequest(
                    null,
                    createAction(PAY_RESERVATION),
                    `${window.API_BASE_URL}/api/public/v1/summits/${purchaseSummit.id}/orders/${reservation.hash}/checkout`,
                    normalizedEntity,
                    authErrorHandler,
                    // entity
                )(params)(dispatch)
                    .then((payload) => {
                        dispatch(stopLoading());
                        if (reservation.hasOwnProperty('tickets') && reservation.tickets.length <= window.MAX_TICKET_QTY_TO_EDIT && hasTicketExtraQuestion) {
                            dispatch(checkOrderData());
                            history.push(stepDefs[3]);
                            return (payload);
                        }
                        dispatch(checkOrderData());

                        history.push(stepDefs[4]);
                        return (payload);
                    })
                    .catch(e => {
                        dispatch(stopLoading());
                        return (e);
                    });
                // The payment has succeeded. Display a success message.
            }
        })
            .catch(e => {
                console.log('error', e)
                dispatch(stopLoading());
                return (e);
            });
    }
}

export const getUserOrders = (updateId, page = 1, per_page = 5) => async (dispatch, getState) => {
    const accessToken = await getAccessToken().catch(_ => dispatch(openWillLogoutModal()));
    if (!accessToken) return;

    dispatch(startLoading());

    let params = {
        access_token: accessToken,
        expand: 'extra_questions, tickets, tickets.refund_requests, tickets.owner, tickets.owner.extra_questions, tickets.badge, tickets.badge.features',
        order: '-id',
        filter: 'status==Confirmed,status==Paid,status==Error',
        page: page,
        per_page: per_page
    };

    return getRequest(
        null,
        createAction(GET_USER_ORDERS),
        `${window.API_BASE_URL}/api/v1/summits/all/orders/me`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            if (updateId) {
                dispatch(selectOrder({}, updateId))
            } else {
                dispatch(getUserSummits('orders'));
            }
        }
    ).catch(e => {
        dispatch(stopLoading());
        return (e);
    });
}

export const selectOrder = (order, updateId = null) => (dispatch, getState) => {

    dispatch(startLoading());

    if (updateId) {
        let {orderState: {memberOrders}} = getState();
        let updatedOrder = memberOrders.find(o => o.id === updateId);
        dispatch(createAction(SELECT_ORDER)(updatedOrder));
        dispatch(stopLoading());
    } else {
        dispatch(createAction(SELECT_ORDER)(order));
        dispatch(stopLoading());
    }

    return Promise.resolve();
}

export const cancelOrder = (order) => async (dispatch, getState) => {

    let {orderState: {current_page}} = getState();
    const accessToken = await getAccessToken().catch(_ => dispatch(openWillLogoutModal()));
    if (!accessToken) return;

    dispatch(startLoading());

    let params = {
        access_token: accessToken
    };

    return deleteRequest(
        null,
        createAction(REFUND_ORDER),
        `${window.API_BASE_URL}/api/v1/summits/all/orders/${order.id}/refund`,
        {},
        authErrorHandler
    )(params)(dispatch).then((payload) => {
            dispatch(getUserOrders(order.id, current_page));
            dispatch(stopLoading());
    }).catch(e => {
        dispatch(stopLoading());
        throw (e);
    });
}


export const updateOrderTickets = (tickets) => (dispatch, getState) => {
    let {orderState: {purchaseOrder: {reservation}}} = getState();

    dispatch(startLoading());

    let params = {
        expand: 'tickets, tickets.owner'
    };

    tickets = tickets.map((t) => ({
        id: t.id,
        attendee_first_name: t.attendee_first_name,
        attendee_last_name: t.attendee_last_name,
        attendee_company: t.attendee_company,
        attendee_email: t.attendee_email,
        extra_questions: t.extra_questions,
        disclaimer_accepted: t.disclaimer_accepted,
        share_contact_info: t.share_contact_info
    }));

    return putRequest(
        null,
        createAction(CLEAR_RESERVATION),
        `${window.API_BASE_URL}/api/public/v1/summits/all/orders/${reservation.hash}/tickets`,
        {'tickets': tickets},
        authErrorHandler
    )(params)(dispatch)
        .then(() => {
            dispatch(stopLoading());
            // is is free, the payReservation method should perform the navigation
            const isFree = reservation.discount_amount == reservation.raw_amount;
            if (!isFree) {
                history.push(stepDefs[4]);
            }
        }).catch(e => {
            dispatch(stopLoading());
            return (e);
        });
};