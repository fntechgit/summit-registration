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

import { START_LOADING, STOP_LOADING, LOGOUT_USER, RECEIVE_COUNTRIES } from "openstack-uicore-foundation/lib/actions";
import { RECEIVE_MARKETING_SETTINGS } from '../actions/summit-actions';

const DEFAULT_STATE = {
    loading: false,
    countries: [],
    marketingSettings: null,
}

const baseReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action

    switch(type){
        case LOGOUT_USER:
            return DEFAULT_STATE;
        case START_LOADING:
            return {...state, loading: true};
            break;
        case STOP_LOADING:
            return {...state, loading: false};
            break;
        case RECEIVE_COUNTRIES:
            return {...state, countries: payload};
        case RECEIVE_MARKETING_SETTINGS: {
            const {data} = payload.response;
            // set color vars
            if (typeof document !== 'undefined') {
                data.forEach(setting => {
                    if (getComputedStyle(document.documentElement).getPropertyValue(`--${setting.key}`)) {
                        document.documentElement.style.setProperty(`--${setting.key}`, setting.value);
                        document.documentElement.style.setProperty(`--${setting.key}50`, `${setting.value}50`);
                    }
                });
            }
            return {...state, marketingSettings: data};
        }
        default:
            return state;
    }
}

export default baseReducer
