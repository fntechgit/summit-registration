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

import {LOGOUT_USER, START_LOADING, STOP_LOADING} from "openstack-uicore-foundation/lib/actions";
import {GET_INVITATION_BY_HASH, GET_INVITATION_BY_HASH_ERROR} from "../actions/invitation-actions";


const DEFAULT_STATE = {
    loading: false,
    selectedInvitation: null,
    errors: null,
};

const InvitationReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;

    switch(type) {
        case LOGOUT_USER:
            return DEFAULT_STATE;
        case START_LOADING:
            return {...state, loading: true};
            break;
        case STOP_LOADING:
            return {...state, loading: false};
            break;
        case GET_INVITATION_BY_HASH:
            return {...state, selectedInvitation: payload.response};
        case GET_INVITATION_BY_HASH_ERROR:
            if (payload.status === 412) {
                let {errors} = payload.body;
                return {...state, selectedInvitation: null, errors, loading: false};
            }
            return {...state, selectedInvitation: null, loading: false};
        default:
            return state;
            break;
    }
};

export default InvitationReducer;