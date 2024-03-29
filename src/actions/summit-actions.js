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

import {
    authErrorHandler,
    createAction,
    getAccessToken,
    getRequest,
    showMessage,
    startLoading,
    stopLoading
} from "openstack-uicore-foundation/lib/methods";
import T from "i18n-react/dist/i18n-react";
import history from '../history'

import Swal from 'sweetalert2';

import URI from 'urijs';

import {LOGOUT_USER} from "openstack-uicore-foundation/lib/actions";
import {setTotalSteps} from "./wizzard-actions";
import {clearAuthState, openWillLogoutModal} from "./auth-actions";
import {getAttendeeProfileForSummit} from "./user-actions";

export const GET_SUMMIT_BY_SLUG = 'GET_SUMMIT_BY_SLUG';
export const GET_SUMMIT_BY_ID = 'GET_SUMMIT_BY_ID';
export const SELECT_SUMMIT = 'SELECT_SUMMIT';
export const SUMMIT_NOT_FOUND = 'SUMMIT_NOT_FOUND';
export const SELECT_PURCHASE_SUMMIT = 'SELECT_PURCHASE_SUMMIT';
export const GET_SUGGESTED_SUMMITS = 'GET_SUGGESTED_SUMMITS';
export const GET_SUMMIT_REFUND_POLICY = 'GET_SUMMIT_REFUND_POLICY';
export const RECEIVE_MARKETING_SETTINGS = 'RECEIVE_MARKETING_SETTINGS';
export const CLEAR_MARKETING_SETTINGS = 'CLEAR_MARKETING_SETTINGS';
export const GET_MAIN_EXTRA_QUESTIONS = 'GET_MAIN_EXTRA_QUESTIONS';
export const CLEAR_SUMMIT_STATE = 'CLEAR_SUMMIT_STATE';
export const GET_SUMMIT_ALLOWED_TICKET_TYPES = 'GET_SUMMIT_ALLOWED_TICKET_TYPES';

export const handleResetReducers = () => (dispatch) => {
    dispatch(createAction(LOGOUT_USER)({}));
}

export const getSummitBySlug = (slug, updateSummit) => (dispatch) => {

    let params = {
        expand: 'ticket_types,ticket_types.badge_type,ticket_types.badge_type.access_levels'
    }

    dispatch(startLoading());

    return getRequest(
        dispatch(startLoading()),
        createAction(GET_SUMMIT_BY_SLUG),
        `${window.API_BASE_URL}/api/public/v1/summits/all/${slug}`,
        customErrorHandler
    )(params)(dispatch).then((payload) => {
            const summit = payload.response;
            const { id: summitId } = summit;

            if (updateSummit)
                dispatch(createAction(SELECT_SUMMIT)(payload.response, false));
            dispatch(getMainOrderExtraQuestions(summitId))
            dispatch(setMarketingSettings(summitId));
            dispatch(getAttendeeProfileForSummit(summitId));
            dispatch(stopLoading());
            return summit;
        }
    ).catch(e => {
        dispatch(createAction(SUMMIT_NOT_FOUND)({}))
        dispatch(stopLoading());
        return (e);
    });
}

export const getAllowedTicketTypes = (summitId) =>  async (dispatch, getState) => {
    const accessToken = await getAccessToken().catch(_ => dispatch(openWillLogoutModal()));
    if (!accessToken) return;
    let params = {
        access_token: accessToken
    };

    dispatch(startLoading());

    return getRequest(
        dispatch(startLoading()),
        createAction(GET_SUMMIT_ALLOWED_TICKET_TYPES),
        `${window.API_BASE_URL}/api/v1/summits/${summitId}/ticket-types/allowed`,
        authErrorHandler
    )(params)(dispatch).then((payload) => {
        dispatch(stopLoading());
    }).catch(e => {
        dispatch(stopLoading());
        return (e);
    });
}

export const getUserSummits = (from) => (dispatch, getState) => {

    dispatch(startLoading());

    let {orderState: {memberOrders}, ticketState: {memberTickets}, summitState: {summits}} = getState();

    let summitsId;

    if (from === 'tickets') {
        summitsId = [...new Set(memberTickets.map(p => p.owner.summit_id))];
    } else {
        summitsId = [...new Set(memberOrders.map(p => p.summit_id))];
    }

    const storedSummits = [...new Set(summits.map(p => p.id))];

    summitsId = summitsId.filter(s => storedSummits.indexOf(s) == -1);
    const summitCall = summitsId.map(s => dispatch(getSummitById(s)));
    Promise.all([...summitCall]).then(() => {
            dispatch(stopLoading());
        }
    ).catch(e => {
        dispatch(stopLoading());
        return (e);
    });

}

export const getSummitById = (id, select = false) => (dispatch, getState) => {
    dispatch(startLoading());

    let params = {
        expand: 'ticket_types,ticket_types.badge_type,ticket_types.badge_type.access_levels'
    }

    return getRequest(
        dispatch(startLoading()),
        createAction(GET_SUMMIT_BY_ID),
        `${window.API_BASE_URL}/api/public/v1/summits/all/${id}`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            select ? dispatch(selectSummitById(id)) : null;
        }
    ).catch(e => {
        dispatch(stopLoading());
        return (e);
    });
}

export const getSuggestedSummits = () => (dispatch, getState) => {

    dispatch(startLoading());
    dispatch(clearAuthState());
    dispatch(createAction(CLEAR_SUMMIT_STATE)());
    dispatch(createAction(CLEAR_MARKETING_SETTINGS)());

    let params = {
        filter: 'ticket_types_count>0',
        expand: 'ticket_types,ticket_types.badge_type,ticket_types.badge_type.access_levels'
    };

    return getRequest(
        dispatch(startLoading()),
        createAction(GET_SUGGESTED_SUMMITS),
        `${window.API_BASE_URL}/api/public/v1/summits/all`,
        authErrorHandler
    )(params)(dispatch).then(() => {
            dispatch(stopLoading());
        }
    ).catch(e => {
        dispatch(stopLoading());
        return (e);
    });

}

export const getSummitRefundPolicy = (id, select = false) => async (dispatch, getState) => {

    const accessToken = await getAccessToken().catch(_ => dispatch(openWillLogoutModal()));
    if (!accessToken) return;

    let params = {
        access_token: accessToken
    };

    dispatch(startLoading());

    return getRequest(
        dispatch(startLoading()),
        createAction(GET_SUMMIT_REFUND_POLICY),
        `${window.API_BASE_URL}/api/v1/summits/${id}/refund-policies`,
        authErrorHandler
    )(params)(dispatch).then((payload) => {
        dispatch(stopLoading());
    }).catch(e => {
        dispatch(stopLoading());
        return (e);
    });
}

export const selectSummit = (summit, updateSummit = true) => (dispatch, getState) => {
    return dispatch(getSummitBySlug(summit.slug, updateSummit));
}

export const selectPurchaseSummit = (slug) => (dispatch, getState) => {
    dispatch(startLoading());

    let {summitState: {suggestedSummits}} = getState();

    let summit = suggestedSummits.find(s => s.slug === slug);

    dispatch(createAction(SELECT_PURCHASE_SUMMIT)(summit));

    dispatch(getAttendeeProfileForSummit(summit.id));

    //const { ticket_types } = summit;

    //const totalSteps = ticket_types.length > 0 && ticket_types[0].cost === 0 ? 3 : 4;

    dispatch(setTotalSteps(4));

    history.push(`/a/${slug}/`);
};

export const selectSummitById = (id) => (dispatch, getState) => {
    let {summitState: {summits}} = getState();

    let selectedSummit = summits.filter(s => s.id === id)[0];

    dispatch(startLoading());

    if (selectedSummit) {
        dispatch(selectSummit(selectedSummit));
    } else {
        dispatch(getSummitById(id, true));
    }
};

export const setMarketingSettings = (summitId) => (dispatch) => {

    let params = {
        per_page: 100,
        page: 1
    };

    return getRequest(
        null,
        createAction(RECEIVE_MARKETING_SETTINGS),
        `${window.MARKETING_API_BASE_URL}/api/public/v1/config-values/all/shows/${summitId}`,
        authErrorHandler
    )(params)(dispatch);
};

export const getMainOrderExtraQuestions = (summitId) => async (dispatch) => {


    dispatch(startLoading());

    let apiUrl = URI(`${window.API_BASE_URL}/api/public/v1/summits/${summitId}/order-extra-questions`);
    apiUrl.addQuery('filter[]', 'class==MainQuestion');
    apiUrl.addQuery('filter[]', 'usage==Ticket');
    apiUrl.addQuery('expand', '*sub_question_rules,*sub_question,*values')
    apiUrl.addQuery('order', 'order');
    apiUrl.addQuery('page', 1);
    apiUrl.addQuery('per_page', 100);

    return getRequest(
        null,
        createAction(GET_MAIN_EXTRA_QUESTIONS),
        `${apiUrl}`,
        authErrorHandler
    )({})(dispatch).then(() => {
        dispatch(stopLoading());
    }).catch(e => {
        console.log('ERROR: ', e);
        dispatch(stopLoading());
        return Promise.reject(e);
    });
};

export const customErrorHandler = (err, res) => (dispatch, state) => {
    let code = err.status;
    let msg = '';

    dispatch(stopLoading());

    switch (code) {
        case 403:
            let error_message = {
                title: 'ERROR',
                html: T.translate("errors.user_not_authz"),
                type: 'error'
            };

            dispatch(showMessage(error_message, initLogOut));
            break;
        case 401:
            let currentLocation = window.location.pathname;
            let clearing_session_state = window.clearing_session_state || false;

            dispatch({
                type: CLEAR_SESSION_STATE,
                payload: {}
            });

            if (!clearing_session_state) {
                window.clearing_session_state = true;
                console.log('authErrorHandler 401 - re login');
                doLogin(currentLocation);
            }
            break;
        // case 404:
        //     msg = "";

        //     if (err.response.body && err.response.body.message) msg = err.response.body.message;
        //     else if (err.response.error && err.response.error.message) msg = err.response.error.message;
        //     else msg = err.message;

        //     Swal.fire("Not Found", msg, "warning");

        //     break;
        case 412:
            for (var [key, value] of Object.entries(err.response.body.errors)) {
                if (isNaN(key)) {
                    msg += key + ': ';
                }

                msg += value + '<br>';
            }
            Swal.fire("Validation error", msg, "warning");
            dispatch({
                type: VALIDATE,
                payload: {errors: err.response.body.errors}
            });
            break;
        default:
        // Swal.fire("ERROR", T.translate("errors.server_error"), "error");
    }
}