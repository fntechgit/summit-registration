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
import {
    authErrorHandler,
    getAccessToken,
    getRequest,
    putRequest,
    deleteRequest,
    createAction,
    stopLoading,
    startLoading,
    objectToQueryString,
} from 'openstack-uicore-foundation/lib/methods';
import { getUserSummits, selectSummitById } from "./summit-actions";
import { getUserOrders } from "./order-actions";
import { openWillLogoutModal } from "./auth-actions";

import Swal from 'sweetalert2';

export const RESET_TICKET             = 'RESET_TICKET';
export const GET_TICKETS              = 'GET_TICKETS';
export const SELECT_TICKET            = 'SELECT_TICKET';
export const CHANGE_TICKET            = 'CHANGE_TICKET';
export const ASSIGN_TICKET            = 'ASSIGN_TICKET';
export const REMOVE_TICKET_ATTENDEE   = 'REMOVE_TICKET_ATTENDEE';
export const REFUND_TICKET            = 'REFUND_TICKET';
export const GET_TICKET_BY_HASH       = 'GET_TICKET_BY_HASH';
export const GET_TICKET_BY_HASH_ERROR = 'GET_TICKET_BY_HASH_ERROR';
export const ASSIGN_TICKET_BY_HASH    = 'ASSIGN_TICKET_BY_HASH';
export const GUEST_TICKET_COMPLETED   = 'GUEST_TICKET_COMPLETED';
export const REGENERATE_TICKET_HASH   = 'REGENERATE_TICKET_HASH';
export const RESEND_NOTIFICATION      = 'RESEND_NOTIFICATION';

const customFetchErrorHandler = (response) => {
  let code = response.status;
  let msg = response.statusText;

  switch (code) {
      case 403:
          Swal.fire("ERROR", T.translate("errors.user_not_authz"), "warning");
          break;
      case 401:
          Swal.fire("ERROR", T.translate("errors.session_expired"), "error");
          break;
      case 412:
          msg = '';
          for (var [key, value] of Object.entries(response.errors)) {
              if (isNaN(key)) {
                  msg += key + ': ';
              }

              msg += value + '<br>';
          }
          Swal.fire("Validation error", msg, "warning");          
          break;
      case 500:
          Swal.fire("ERROR", T.translate("errors.server_error"), "error");
  }
}

export const handleResetTicket = () => (dispatch, getState) => {
  dispatch(createAction(RESET_TICKET)({}));
}


export const getUserTickets = (ticketRefresh, page = 1, per_page = 5) => async (dispatch, getState) => {

  const accessToken = await getAccessToken().catch(_ => dispatch(openWillLogoutModal()));
  if (!accessToken) return;
  
  let params = {
      access_token : accessToken,
      expand       : 'order, owner, owner.extra_questions, order, badge, badge.features, refund_requests',
      order        : '-id',
      filter       : 'status==Confirmed,status==Paid,status==Error',
      page         : page,
      per_page     : per_page,
  };    

  dispatch(startLoading());

  return getRequest(
      null,
      createAction(GET_TICKETS),      
      `${window.API_BASE_URL}/api/v1/summits/all/orders/all/tickets/me`,
      authErrorHandler
  )(params)(dispatch).then(() => {
      if(ticketRefresh){
        dispatch(selectTicket({}, false, ticketRefresh))
      } else {
        dispatch(getUserSummits('tickets'));
      }      
    }
  ).catch(e => {
    dispatch(stopLoading());
    return (e);
  });

}

export const selectTicket = (ticket, ticketList = false, ticketRefresh) => (dispatch, getState) => {
    
  dispatch(startLoading());

  if(ticketList){
    dispatch(selectSummitById(ticket.order.summit_id));
    if(ticketRefresh) {
      let {ticketState: {memberTickets}} = getState();
      let memberTicket = memberTickets.find(t => t.id === ticketRefresh);
      dispatch(createAction(SELECT_TICKET)(memberTicket));
    }
    dispatch(createAction(SELECT_TICKET)(ticket));    
  } else if (Object.entries(ticket).length === 0 && ticket.constructor === Object) {
    dispatch(stopLoading());
  } else {
    dispatch(createAction(SELECT_TICKET)(ticket));
    dispatch(stopLoading());
  }

}

export const handleTicketChange = (ticket, errors = {}) => (dispatch, getState) => {    

    // if (validator.isEmpty(ticket.attendee_first_name)) errors.attendee_first_name = 'Please enter your First Name.';
    // if (validator.isEmpty(ticket.attendee_last_name)) errors.attendee_last_name = 'Please enter your Last Name.';
    // if (!validator.isEmail(ticket.attendee_email)) errors.attendee_email = 'Please enter a valid Email.';    

    /*ticket.tickets.forEach(tix => {
        if (tix.coupon && tix.coupon.code == 'NOTACOUPON') errors[`tix_coupon_${tix.id}`] = 'Coupon not valid.';
        else delete(errors[`tix_coupon_${tix.id}`]);

        if (tix.email && !validator.isEmail(tix.email)) errors[`tix_email_${tix.id}`] = 'Please enter a valid Email.';
        else delete(errors[`tix_email_${tix.id}`]);
    });*/        
    dispatch(createAction(CHANGE_TICKET)({ticket, errors}));      

}

export const assignAttendee = (attendee_email, attendee_first_name, attendee_last_name, attendee_company, disclaimer_accepted, extra_questions, reassignOrderId = null, refreshTickets = false) => async (dispatch, getState) => {
      
  let { orderState: { selectedOrder }, ticketState: { selectedTicket } } = getState();
  
  const accessToken = await getAccessToken().catch(_ => dispatch(openWillLogoutModal()));
  if (!accessToken) return;

  let orderPage = getState().orderState.current_page;   
  let ticketPage = getState().ticketState.current_page;   

  dispatch(startLoading());

  let params = {
    access_token : accessToken,
    expand: 'owner, owner.extra_questions'
  };

  let normalizedEntity = {}

  if(!attendee_first_name & !attendee_last_name) {
    normalizedEntity = { attendee_email };  
  } else {
    normalizedEntity = { attendee_email, attendee_first_name, attendee_last_name, attendee_company, extra_questions, disclaimer_accepted };
  }

  let order_id = reassignOrderId ? reassignOrderId : selectedOrder.id;
  
  return putRequest(
    null,
    createAction(ASSIGN_TICKET),
    `${window.API_BASE_URL}/api/v1/summits/all/orders/${order_id}/tickets/${selectedTicket.id}/attendee`,
    normalizedEntity,
    authErrorHandler
  )(params)(dispatch).then(() => {
      if(reassignOrderId) {
        refreshTickets ? dispatch(getUserTickets(selectedTicket.id, ticketPage)) : dispatch(getUserOrders(selectedOrder.id, orderPage));
        dispatch(getUserTickets(selectedTicket.id, ticketPage))
      } else {
        dispatch(getUserOrders(selectedOrder.id, orderPage));
      }
    }
  ).catch(e => {
    dispatch(stopLoading());
    return (e);
  });
}


export const editOwnedTicket = (attendee_email, attendee_first_name, attendee_last_name, attendee_company, disclaimer_accepted, extra_questions, updateOrder = false) => async (dispatch, getState) => {  

  let { orderState: { selectedOrder }, ticketState: { selectedTicket } } = getState();

  let orderPage = getState().orderState.current_page;   
  let ticketPage = getState().ticketState.current_page;   

  dispatch(startLoading());

  const accessToken = await getAccessToken().catch(_ => dispatch(openWillLogoutModal()));
  if (!accessToken) return;

  let params = {
    access_token : accessToken,
    expand: 'owner, owner.extra_questions'
  };

  let normalizedEntity = { attendee_email, attendee_first_name, attendee_last_name, attendee_company, disclaimer_accepted, extra_questions };

  return putRequest(
      null,
      createAction(ASSIGN_TICKET),
      `${window.API_BASE_URL}/api/v1/summits/all/orders/all/tickets/${selectedTicket.id}`,
      normalizedEntity,
      authErrorHandler
  )(params)(dispatch).then(() => {
      updateOrder ? dispatch(getUserOrders(selectedOrder.id, orderPage)) : dispatch(getUserTickets(null, ticketPage));      
    }
  ).catch(e => {
    dispatch(stopLoading());
    return (e);
  });
};

export const resendNotification = () => async (dispatch, getState) => {
  
  let { loggedUserState, ticketState: { selectedTicket } } = getState();
  
  const accessToken = await getAccessToken().catch(_ => dispatch(openWillLogoutModal()));
  if (!accessToken) return;

  dispatch(startLoading());

  let orderId = selectedTicket.order ? selectedTicket.order.id : selectedTicket.order_id;

  let params = {
    access_token : accessToken
  };

  return putRequest(
    null,
    createAction(RESEND_NOTIFICATION),
    `${window.API_BASE_URL}/api/v1/summits/all/orders/${orderId}/tickets/${selectedTicket.id}/attendee/reinvite`,
    authErrorHandler
  )(params)(dispatch).then(() => {
    dispatch(stopLoading());
  }).catch(e => {
    dispatch(stopLoading());
    return (e);
  });
  
}

export const removeAttendee = (tempTicket, fromTicket = false) => async (dispatch, getState) => {

  let { ticketState: { selectedTicket } } = getState();
  
  const accessToken = await getAccessToken().catch(_ => dispatch(openWillLogoutModal()));
  if (!accessToken) return;

  dispatch(startLoading());

  let params = {
    access_token : accessToken,
    expand: 'order, owner, owner.extra_questions, order.summit'
  };

  let orderId = selectedTicket.order ? selectedTicket.order.id : selectedTicket.order_id;

  let {attendee_email, reassign_email} = tempTicket;
  if(reassign_email) attendee_email = reassign_email;
  let emptyFirstName, emptyLastName , emptyAttendeeCompany = '';

  return deleteRequest(
      null,
      createAction(REMOVE_TICKET_ATTENDEE),        
      `${window.API_BASE_URL}/api/v1/summits/all/orders/${orderId}/tickets/${selectedTicket.id}/attendee`,
      {},
      authErrorHandler
  )(params)(dispatch).then(() => {
      dispatch(assignAttendee(attendee_email, emptyFirstName, emptyLastName,emptyAttendeeCompany, false,[], orderId, fromTicket));
    }).catch((e) => {
      console.log('error', e)
      dispatch(stopLoading());
      return (e);
    });

}

export const getTicketPDF = () => async (dispatch, getState) => {

  let { ticketState: { selectedTicket } } = getState();
  
  const accessToken = await getAccessToken().catch(_ => dispatch(openWillLogoutModal()));
  if (!accessToken) return;

  dispatch(startLoading());

  let params = {
    access_token : accessToken
  };

  let orderId = selectedTicket.order ? selectedTicket.order.id : selectedTicket.order_id;

  let queryString = objectToQueryString(params);
  let apiUrl = `${window.API_BASE_URL}/api/v1/summits/all/orders/all/tickets/${selectedTicket.id}/pdf?${queryString}`;  

    return fetch(apiUrl, { responseType: 'Blob', headers: {'Content-Type': 'application/pdf'}})
        .then((response) => {            
            if (!response.ok) {
                dispatch(stopLoading());
                throw response;
            } else {
                return response.blob();
            }
        })
        .then((pdf) => {
            dispatch(stopLoading());            
            let link = document.createElement('a');
            const url = window.URL.createObjectURL(pdf);
            link.href = url;
            link.download = 'ticket.pdf';
            link.dispatchEvent(new MouseEvent('click'));
        })
        .catch(customFetchErrorHandler);
};

export const refundTicket = (ticket) => async (dispatch, getState) => {
  
  let { orderState: { selectedOrder }, ticketState: {selectedTicket }} = getState();
  let orderPage = getState().orderState.current_page;   
  let ticketPage = getState().ticketState.current_page;   

  const accessToken = await getAccessToken().catch(_ => dispatch(openWillLogoutModal()));
  if (!accessToken) return;

  let orderId = ticket.order ? ticket.order.id : ticket.order_id;  

  dispatch(startLoading());

  let params = {
    access_token : accessToken
  };

  return deleteRequest(
      null,
      createAction(REFUND_TICKET),
      `${window.API_BASE_URL}/api/v1/summits/all/orders/${orderId}/tickets/${ticket.id}/refund`,
      {},
      authErrorHandler
  )(params)(dispatch).then((payload) => {
      if(ticket.order_id) {        
        dispatch(getUserOrders(selectedOrder.id, orderPage));      
      } else {        
        dispatch(getUserTickets(selectedTicket.id, ticketPage));        
      }             
    }
  ).catch(e => {
    dispatch(stopLoading());
    throw(e);
  });

}

export const getTicketByHash = (hash) => (dispatch, getState) => {

  dispatch(startLoading());

  let params = {
    expand : 'order_extra_questions.values, owner, owner.extra_questions, badge, badge.features'
  };

  return getRequest(
      null,
      createAction(GET_TICKET_BY_HASH),
      `${window.API_BASE_URL}/api/public/v1/summits/all/orders/all/tickets/${hash}`,
      null,
  )(params)(dispatch).then((ticket) => {     
      dispatch(selectSummitById(ticket.response.owner.summit_id, true));      
    }).catch((err) => {      
      dispatch(createAction(GET_TICKET_BY_HASH_ERROR)(err.res));
      //dispatch(handleResetTicket());
      dispatch(stopLoading());
    });
      
}

export const assignTicketByHash = (attendee_first_name, attendee_last_name, attendee_company, disclaimer_accepted, share_contact_info, extra_questions, hash) => (dispatch, getState) => {

  dispatch(startLoading());

  let params = {
    expand : 'order_extra_questions.values, owner, owner.extra_questions, badge, badge.features'
  };

  let normalizedEntity = {attendee_first_name, attendee_last_name, attendee_company, disclaimer_accepted, share_contact_info, extra_questions};

  return putRequest(
    null,
    createAction(ASSIGN_TICKET_BY_HASH),
    `${window.API_BASE_URL}/api/public/v1/summits/all/orders/all/tickets/${hash}`,
    normalizedEntity,
    authErrorHandler
  )(params)(dispatch).then(() => {
    dispatch(createAction(GUEST_TICKET_COMPLETED)({}));
    dispatch(stopLoading());
  }).catch(e => {
    dispatch(stopLoading());
    return (e);
  });
}

export const regenerateTicketHash = (formerHash) => (dispatch, getState) => {
  dispatch(startLoading());

  return putRequest(
      null,
      createAction(REGENERATE_TICKET_HASH),
      `${window.API_BASE_URL}/api/public/v1/summits/all/orders/all/tickets/${formerHash}/regenerate`,
      authErrorHandler
  )()(dispatch).then(() => {
      Swal.fire("SUCCESS", T.translate("guests.hash_regenerated"), "success");
      dispatch(stopLoading());
    }
  ).catch(e => {
    dispatch(stopLoading());
    return (e);
  });
}

export const getTicketPDFByHash = (hash) => (dispatch, getState) => {
  
  dispatch(startLoading());

  const apiUrl = `${window.API_BASE_URL}/api/public/v1/summits/all/orders/all/tickets/${hash}/pdf`;

  let link = document.createElement('a');  
  link.href = apiUrl;
  link.download = 'ticket.pdf';
  link.dispatchEvent(new MouseEvent('click'));

  dispatch(stopLoading());
  
}