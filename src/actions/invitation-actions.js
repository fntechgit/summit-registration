/**
 * Copyright 2020
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

import { initLogOut } from "openstack-uicore-foundation/lib/methods";
import T from "i18n-react/dist/i18n-react";


import {
    getAccessToken,
    getRequest,
    createAction,
    stopLoading,
    startLoading,
    showMessage,
} from 'openstack-uicore-foundation/lib/methods';

import Swal from 'sweetalert2';
import {getMainOrderExtraQuestions, selectSummitById, setMarketingSettings} from "./summit-actions";
import { openWillLogoutModal } from "./auth-actions";
import {getAttendeeProfileForSummit} from "./user-actions";
export const GET_INVITATION_BY_HASH       = 'GET_INVITATION_BY_HASH';
export const GET_INVITATION_BY_HASH_ERROR = 'GET_INVITATION_BY_HASH_ERROR';
export const RESET_INVITATION = 'RESET_INVITATION';
export const INVALID_INVITATION = 'INVALID_INVITATION';

const customErrorHandler = (err, res) => (dispatch) => {
    let code = err.status;
    dispatch(stopLoading());

    let msg = '';

    switch (code) {
        case 403:
            dispatch(showMessage(  {
                title: 'ERROR',
                html: T.translate("errors.user_not_authz"),
                type: 'error'
            }, initLogOut ));
            break;
        case 404:
            msg = "";

            if (err.response.body && err.response.body.message) msg = err.response.body.message;
            else if (err.response.error && err.response.error.message) msg = err.response.error.message;
            else msg = err.message;

            Swal.fire("Not Found", msg, "warning");

            break;
        case 412:
            for (var [key, value] of Object.entries(err.response.body.errors)) {
                if (isNaN(key)) {
                    msg += key + ': ';
                }

                msg += value;
            }
            dispatch(createAction(INVALID_INVITATION)(msg));            
            break;
        default:
            Swal.fire("ERROR", T.translate("errors.server_error"), "error");
    }
}

export const getInvitationByHash = (hash) => async (dispatch, getState) => {
    
    const accessToken = await getAccessToken().catch(_ => dispatch(openWillLogoutModal()));
    if (!accessToken) return;
    
    dispatch(startLoading());

    let params = {
        access_token : accessToken,
    };

    return getRequest(
        createAction(RESET_INVITATION),
        createAction(GET_INVITATION_BY_HASH),
        `${window.API_BASE_URL}/api/v1/summits/all/registration-invitations/${hash}`,
        customErrorHandler,
    )(params)(dispatch).then((payload) => {
        const {response : invitation } = payload;
        const {summit_id : summitId} = invitation;

        dispatch(selectSummitById(summitId, true));
        dispatch(getAttendeeProfileForSummit(summitId));
        dispatch(getMainOrderExtraQuestions(summitId));
        dispatch(setMarketingSettings(summitId));

    }).catch((err) => {
        dispatch(createAction(GET_INVITATION_BY_HASH_ERROR)(err.res));
        //dispatch(handleResetTicket());
        dispatch(stopLoading());
    });
};
